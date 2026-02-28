---
title: "Python標準ライブラリgraphlibでDAG並列実行エンジンを作った"
date: "2026-02-24T21:00:00+09:00"
draft: true
tags: [python, graphlib, 並列処理, 設計, LLM]
description: "依存関係のあるLLMタスクを並列実行するために、6つのアプローチを比較検討し、Python標準ライブラリgraphlib.TopologicalSorterとThreadPoolExecutorでReady-Queue方式の並列実行エンジンを設計した過程を記録する。"
---

## はじめに

業務でLLMを活用したシステムを開発しています。
ユーザーの質問を複数のサブタスクに分解して、タスクごとにLLMを呼び出して回答を生成する機能があるのですが、この処理が直列で動いていました。

パフォーマンスの観点から並列化したかったのですが、タスク間には依存関係があり、単純に `asyncio.gather` で並列化すれば済むという話ではありませんでした。

6つのアプローチを比較検討した結果、Python標準ライブラリ `graphlib.TopologicalSorter` を使ったReady-Queue方式に落ち着いたので、その検討過程をまとめます。

## なぜ単純な並列化では足りないのか

問題のコードは単純なforループでした。

```python
for task in subtasks:
    context = fetch_reference_documents(task)  # S3 I/O
    result = call_llm(task, context)           # LLM API（数十秒）
    save_result(task, result)                  # DB書き込み
```

LLM APIの呼び出しが1タスクあたり数十秒かかるので、タスク数に比例して合計時間が線形に増加します。
5タスクなら約30秒 × 5 = 約150秒。ここまでなら単純に `asyncio.gather` で並列化すれば解決です。

しかし、今回のケースでは、タスク間には依存関係が存在します。
あるタスクの出力を、別のタスクのプロンプトに「前提情報（prior context）」として注入する必要があり、
タスクAの結果がタスクBの前提条件になる場合、タスクBはタスクAの完了を待つ必要があります。

つまり必要なのは、「依存関係を考慮した上で、可能な限り並列に実行する仕組み」です。

LLMと相談しながら考えていくと、これはDAG（有向非巡回グラフ）を活用したスケジューリング問題であるという事がわかりました。

## 6つのアプローチを比較した

DAGベースの並列化といっても方法は一つではありません。LLMと壁打ちしながら6つのアプローチを洗い出しました。

| # | アプローチ              | 概要                                    |
|---|--------------------|-----------------------------------------|
| A | DAGレベル並列         | トポロジカルソートでレベル分割し、レベル単位で並列実行     |
| B | Ready-Queue        | 依存が解決されたタスクを即座にワーカーキューに投入       |
| C | Two-Pass           | 全タスクを一旦並列実行 → 依存ありのタスクだけ再実行 |
| D | Map-Reduce         | 全タスク並列 → LLMで整合性チェック・統合         |
| E | Single-Prompt      | 全タスクを1プロンプトにまとめて1回で処理               |
| F | Streaming/Pipeline | ストリーミング出力の途中結果を後続に即注入        |

### すぐに脱落した3案

- **E. Single-Prompt**: コンテキストウィンドウの制約と「lost in the middle」問題（長いプロンプトで中間部分の注意力が低下する現象）があり、エラー隔離も不可能
- **F. Streaming/Pipeline**: ストリーミング途中ではJSON構造が不完全になるため、部分的な結果の品質保証ができない
- **D. Map-Reduce**: 既存の「最終回答生成」ステップと責務が二重化してしまう

### 残った3案の評価

| 評価軸       | A. DAGレベル並列 | B. Ready-Queue | C. Two-Pass |
|--------------|:-------------:|:--------------:|:-----------:|
| 処理時間削減 |      ★★★      |      ★★★★      |     ★★★     |
| 実装複雑性   |    ★★（低い）    |  ★★★（中程度）   |   ★★（低い）   |
| 解釈品質     |     ★★★★      |      ★★★★      |     ★★★     |

AとBの比較で決め手になったのが**バブル効果**です。

DAGレベル並列は、トポロジカルソートでタスクを「レベル」に分割して、同じレベルのタスクを並列実行します。
しかし、同じレベル内に処理時間が大きく異なるタスクがある場合、最も遅いタスクに全体が引きずられます。

```
DAGレベル並列:
t=0s:   タスクA(5秒), タスクB(30秒) 開始
t=5s:   タスクA完了 ← タスクC(Aに依存)はまだ開始できない
t=30s:  タスクB完了 ← やっとタスクC開始。25秒の無駄

Ready-Queue:
t=0s:   タスクA, タスクB 開始
t=5s:   タスクA完了 → タスクCの依存解決 → 即実行開始
t=30s:  タスクB完了
```

Ready-Queueではタスク単位で依存を解決するので、この無駄な待機が発生しません。
実装複雑性はやや上がりますが、`graphlib.TopologicalSorter` がReady-Queueパターンを標準でサポートしていることがわかり、複雑性の差は許容範囲と判断しました。

Two-Passは「一旦全部並列実行して、依存ありだけ再実行」というアプローチです。
実装はシンプルですが、依存関係があるタスクは毎回再実行することになり、LLM APIコストが無駄になります。

今回は5タスク程度の規模ですが、依存関係が増えるほどコスト効率が悪化するため不採用としました。

## Ready-Queue方式と graphlib.TopologicalSorter

### graphlib.TopologicalSorter とは

Python 3.9で追加された標準ライブラリ `graphlib` の `TopologicalSorter` は、DAGのトポロジカルソートを提供するクラスです（Python 3.9以上が必要です）。

調べてみて驚いたのですが、[公式ドキュメント](https://docs.python.org/ja/3/library/graphlib.html)に**並列実行のためのAPI**が明記されています。
`prepare()` → `get_ready()` → `done()` のサイクルで、依存が解決されたノードを逐次取得できます。

```python
from graphlib import TopologicalSorter

# DAGの定義: {ノード: {依存先, ...}}
graph = {
    "task_a": set(),              # 依存なし
    "task_b": set(),              # 依存なし
    "task_c": {"task_a"},         # task_a に依存
    "task_d": {"task_b", "task_c"}, # task_b, task_c に依存
}

ts = TopologicalSorter(graph)
ts.prepare()

while ts.is_active():
    ready = ts.get_ready()  # 依存が解決済みのノードを取得
    print(f"実行可能: {ready}")
    for node in ready:
        ts.done(node)       # 完了を通知 → 新たなノードがreadyになる
```

### ThreadPoolExecutor との組み合わせ

今回のシステムではエントリポイントが同期関数だったため、`asyncio` ではなく `concurrent.futures.ThreadPoolExecutor` を使いました。
これと `wait(FIRST_COMPLETED)` を組み合わせると、Ready-Queue方式の並列実行エンジンになります。

```python
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from graphlib import TopologicalSorter

def execute_dag_parallel(
    graph: dict[str, set[str]],
    execute_fn,           # タスク実行関数
    max_workers: int = 3, # 同時実行数（APIレートリミット考慮）
):
    ts = TopologicalSorter(graph)
    ts.prepare()

    results = {}
    futures = {}

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        while ts.is_active():
            # 依存解決済みタスクをワーカープールに投入
            for node in ts.get_ready():
                # 依存先タスクの結果をprior contextとして収集
                prior = _collect_prior_context(node, graph, results)
                future = executor.submit(execute_fn, node, prior)
                futures[future] = node

            # 最初に完了したタスクを処理
            done, _ = wait(futures, return_when=FIRST_COMPLETED)
            for future in done:
                node = futures.pop(future)
                results[node] = future.result()
                ts.done(node)  # 完了通知 → 依存先が解放される

    return results
```

ポイントは3つです。

1. **`wait(FIRST_COMPLETED)`**: 全タスクの完了を待たず、最初に完了したものから処理します。これがバブル効果を防ぎます
2. **`max_workers` でレートリミット制御**: LLM APIには同時リクエスト数の上限があるので、`max_workers` で並列度を制限しています
3. **`execute_fn` のコールバック設計**: タスク実行ロジックを外部から注入することで、スケジューラーをドメインに依存しない汎用的な設計にしました

`_collect_prior_context` は、`graph` から対象ノードの依存先を取得し、その結果を `results` から集めてprior contextとして返す関数です。依存先タスクの出力を後続タスクのプロンプトに注入する仕組みの核になっています。

また、SQLAlchemy Sessionはスレッドセーフではないため、並列ワーカー内ではDBアクセスを一切行わず、結果をメモリ上の辞書（`results`）に蓄積する設計にしました。
全タスク完了後にメインスレッドで一括DB更新することで、スレッド安全性の問題を回避しています。

## まとめ

依存関係のあるタスクの並列実行は、一見シンプルに見えて、方式の選定で考慮すべき点が多かったです。
6つのアプローチを比較検討した結果、DAGレベル並列のバブル効果を避けられるReady-Queue方式を選定し、Python標準ライブラリ `graphlib.TopologicalSorter` で実装しました。

今回の設計で一番学びになったのは、「バブル効果」のような、実装してみないと気づきにくい差がアプローチ間にあるということでした。
比較表を作って評価軸を並べるだけでなく、具体的なタスク構成を想定してシミュレーションしてみることが大事なのかなと思います。

`graphlib` はPython 3.9で追加されたライブラリですが、意外と知られていないように思います。
並列実行用のAPIが公式で用意されている点は特筆に値するので、依存関係付きタスクの並列実行が必要な場面では、外部ライブラリを導入する前に検討してみる価値があると思います。

<!-- 
ドキュメントなど一時情報の引用を追加する
背景説明に図を追加したい




 -->