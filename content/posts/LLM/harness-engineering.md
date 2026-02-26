+++
title = 'Harness Engineeringについて調べた'
date = '2026-02-27T00:25:00+09:00'
draft = false
tags = ['LLM', 'AI', 'ソフトウェアエンジニアリング']
description = 'OpenAI Engineeringが提唱する「Harness Engineering」の読書メモ。Martin Fowlerの解説も踏まえて、エージェントにコードを書かせるために人間は何を設計すべきかを整理しました。'
+++

OpenAI Engineering が公開した記事「Harness engineering: leveraging Codex in an agent-first world」と、Martin Fowler による解説記事を読んだメモです。

https://openai.com/index/harness-engineering/

https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html

## Harness Engineering とは

私個人の解釈としては、**エージェントが正しくコードを書ける環境を設計すること**に注力する設計思想という理解です。

「harness」という言葉については、Mitchell Hashimoto が自身のブログ記事の中で使い始めた用語のようです。

https://mitchellh.com/writing/my-ai-adoption-journey

Hashimoto は harness engineering を「エージェントがミスをしたとき、同じミスを二度と繰り返さないように仕組みを作ること」と説明しています。

> "anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent never makes that mistake again"

Fowler はこれを引き取って「AIエージェントの振る舞いを制御するためのツールとプラクティス」と定義しています。

## エンジニアの役割の再定義

記事の前半では、エンジニアの役割がどう変わるかが語られていました。

OpenAI のチームは空のリポジトリから始めて、5ヶ月で約100万行のコードベースを構築したそうです。そのすべてが Codex によって書かれたとのこと。ここで強調されていたのは、人間の仕事が「コードを書くこと」から「エージェントが正しく動ける環境を作ること」に移ったという点でした。

> "Humans steer. Agents execute."

> "Our most difficult challenges now center on designing environments, feedback loops, and control systems."

人間の役割は実装者ではなく、

- 意図を定義する
- 制約を設計する
- フィードバックループを構築する

存在になるということです。

そして、エージェントがうまく動かないときは、**ツール・ガードレール・ドキュメントなど、何が足りていないのか**を考えるべきだという姿勢が印象的でした。

> "When the agent struggles, we treat it as a signal: identify what is missing—tools, guardrails, documentation—and feed it back into the repository."

プロンプトを工夫して場当たり的に対処するのではなく、根本的な問題を仕組みで解決していくことが重要だということなのかなと思います。

## 記事で紹介されていた原則

記事では、こうした環境を設計するための具体的なプラクティスが全体を通して紹介されていました。Fowler はこれらを以下の3カテゴリに整理しています。

- **Context Engineering** — エージェントに渡す知識と動的な文脈
- **Architectural Constraints** — 機械的に強制されるアーキテクチャ制約
- **Garbage Collection** — 定期的なクリーンアップによる品質維持

それぞれについて、記事の内容をまとめてみました。

### Context Engineering

エージェントに「何を見せるか」の設計です。

OpenAI のチームでは、リポジトリ内に構造化されたドキュメント（`docs/` ディレクトリ）を整備し、それを信頼できる唯一の情報源（SSOT）として扱っているようです。エージェントの起点となる `AGENTS.md` は約100行に抑えられており、すべてを詰め込むのではなく、より詳しい情報への「地図」として機能しているとのことでした。

> "Give a map, not a 1,000-page manual."

静的なドキュメントだけでなく、動的な文脈もエージェントに提供しています。

- Chrome DevTools Protocol を接続して DOM スナップショットやスクリーンショットを取得
- git worktree ごとに一時的な観測可能性スタック（Victoria Logs / Victoria Metrics）を起動
- LogQL / PromQL でエージェントがログやメトリクスを直接クエリ可能

> "Logs, metrics, and traces are exposed to Codex via a local observability stack…"
> "Agents can query logs with LogQL and metrics with PromQL."

これにより、エージェントはバグ再現・修正・UI検証・メトリクス確認・PR作成までを自律的にループできるようになります。

### Architectural Constraints

エージェントが従うべきルールを、ドキュメントではなく**機械的に強制する**というアプローチです。

記事では固定レイヤーモデルが提示されていました。

```
Types → Config → Repo → Service → Runtime → UI
```

特徴としては、

- 依存方向は前方向のみ（逆依存は禁止）
- Cross-cutting concerns は Providers 経由のみ
- カスタム linters + structural tests で機械的に強制
- linter のエラーメッセージ自体が修正手順をエージェントに伝えるように設計されている
- ルール違反は CI で検出

「守ってください」と指示するのではなく、仕組みで「守らせる」設計です。

> "Agents are most effective in environments with strict boundaries and predictable structure…"
> "These constraints are enforced mechanically via custom linters … and structural tests."
> "The constraints are what allows speed without decay or architectural drift."

「制約がスピードを生む」という考え方は、プログラミングパラダイムの発展の歴史にも通じるところがあるなと思いました。

### Garbage Collection

AIコードの問題として、既存パターンを増幅してしまうことが挙げられていました。

> "Codex replicates patterns that already exist in the repository—even uneven or suboptimal ones."

放置すると品質は徐々に劣化します。対策として、

- Golden Principles をリポジトリ内に明文化
- 定期的に background で Codex にクリーンアップタスクを実行させる
- 小さな refactor PR を継続的に出す

> "We started encoding what we call 'golden principles' directly into the repository…"
> "This functions like garbage collection."
> "Technical debt is like a high-interest loan…"

技術的負債はローンであり、小さく継続的に返済するべきだという考え方のようです。


## 読んでみて

テクニックとしては既に実践しているところもあり、そこまで目新しい発想かというとそうでもない気はしました。

たとえば CLAUDE.md にルールを書いてエージェントの動作を制御する、CI や hooks で制約を機械的に強制する、といったことは自分も実践していたり、自分の観測範囲内でもかなり浸透しているプラクティスだと思います。

ただ、可観測性をコンテキストとして提供するアプローチや、継続的にクリーンアップさせるアプローチについては、まだやれていなかったので取り入れたいなと思います。

Martin Fowler は OpenAI の記事について**機能や振る舞いの検証（テスト）についての言及が薄い**という点を指摘していました。

> "All of the described measures focus on increasing long-term internal quality and maintainability. What I am missing in the write-up is verification of functionality and behaviour."

この指摘を読んで、OpenAI のチーム内では実際にどういうテストのアプローチをとっていたのかが気になりました。従来の TDD のような形がそのまま使えるのか、それとも Agent-first な世界ではテストのあり方自体が変わるのか。

## 参考

https://openai.com/index/harness-engineering/

https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html

https://mitchellh.com/writing/my-ai-adoption-journey

## 関連記事

https://www.infoq.com/news/2026/02/openai-harness-engineering-codex/

https://tonylee.im/en/blog/openai-harness-engineering-five-principles-codex
