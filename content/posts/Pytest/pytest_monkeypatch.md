+++
title = 'pytestのmonkeypatchについて調べた'
date = 2025-01-16T20:04:07+09:00
draft = false
tags = ['Pytest']
+++

pytestの`monkeypatch`フィクスチャについて調べたのでまとめます。

## monkeypatchとは

### 概要

`monkeypatch`は、安全にモックやパッチを実行するためのpytestフィクスチャです。

「安全」というのは、テストやフィクスチャの実行完了後に自動的に元の状態に復元されることを指すようです。

主に以下のような用途を想定しているようです。

- グローバルな設定に依存するコードのテスト
- ネットワークアクセスなど、テストが困難な処理の置き換え
- 環境変数やシステムパスの一時的な変更

### 提供される機能

公式ドキュメントによると、`monkeypatch`は以下の機能を提供しています。

#### 1. 属性の操作
- `monkeypatch.setattr(obj, name, value, raising=True)`
  - オブジェクトの属性を設定
  - クラス、モジュール、関数の振る舞いを変更可能
- `monkeypatch.delattr(obj, name, raising=True)`
  - オブジェクトの属性を削除

#### 2. 辞書の操作
- `monkeypatch.setitem(mapping, name, value)`
  - 辞書の項目を設定
- `monkeypatch.delitem(obj, name, raising=True)`
  - 辞書の項目を削除

#### 3. 環境変数の操作
- `monkeypatch.setenv(name, value, prepend=None)`
  - 環境変数を設定
  - `prepend`パラメータでPATH形式の変数を連結可能
- `monkeypatch.delenv(name, raising=True)`
  - 環境変数を削除

#### 4. パスの操作
- `monkeypatch.syspath_prepend(path)`
  - `sys.path`の先頭にパスを追加
  - 名前空間パッケージの修正とインポートキャッシュの無効化も実行
- `monkeypatch.chdir(path)`
  - カレントディレクトリを変更

#### 5. コンテキスト管理
- `monkeypatch.context()`
  - 特定のスコープ内でのみパッチを適用
  - 複雑なフィクスチャのteardownの制御に有用

## 使用例

いくつかの代表的な使用例を紹介します。
コードは公式ドキュメントから引用したものです。

### 1. 関数やメソッドの置き換え

外部APIへのリクエストをモックする例です。

```python
# テスト対象の関数
def get_api_data():
    return requests.get("https://api.example.com/data").json()

# テストコード
def test_get_api_data(monkeypatch):
    def mock_get(*args, **kwargs):
        return type('MockResponse', (), {'json': lambda: {'data': 'test'}})()

    monkeypatch.setattr(requests, 'get', mock_get)
    assert get_api_data() == {'data': 'test'}
```

### 2. 環境変数を使用するコードのテスト

環境変数に依存するコードのテストに便利です。

```python
def test_database_url(monkeypatch):
    # パスを含む環境変数の設定（連結あり）
    monkeypatch.setenv('PATH', '/test/bin', prepend=':')

    # 通常の環境変数の設定
    monkeypatch.setenv('DB_HOST', 'test-db')

    # 環境変数の削除
    monkeypatch.delenv('TEMP_VAR', raising=False)
```

テスト終了後に環境変数が自動で元に戻るので、他のテストへの影響を心配せずに済みます。

### 3. 辞書の操作

設定オブジェクトなど、辞書の値を一時的に変更したい場合

```python
def test_config(monkeypatch):
    config = {'api_key': 'real_key', 'env': 'prod'}
    
    # 値の変更
    monkeypatch.setitem(config, 'api_key', 'test_key')
    
    # 項目の削除
    monkeypatch.delitem(config, 'env', raising=True)
    
    assert config == {'api_key': 'test_key'}
```

公式ドキュメントの例ですが、このケースだと環境変数で管理しそうな気もします。実際の使い所はまだ掴めていません。

### 4. コンテキスト管理の活用

特定のスコープ内でのみパッチを適用したい場合

```python
def test_with_context(monkeypatch):
    original_path = os.getcwd()
    
    with monkeypatch.context() as m:
        # このブロック内でのみ有効なパッチ
        m.setenv('TEMP_VAR', 'temp_value')
        m.chdir('/tmp')
        # テストコード
        
    # コンテキストを抜けると自動的に元の状態に戻る
    assert os.getcwd() == original_path
    assert 'TEMP_VAR' not in os.environ
```

テスト全体ではなく、特定の処理だけにパッチを当てたいときに使えます。スコープを細かく制御できるのが便利です。

### 5. sys.pathの操作

テスト用のモジュールをインポート可能にする例です。

```python
def test_import_path(monkeypatch):
    # テスト用モジュールのパスを追加
    monkeypatch.syspath_prepend('./test_modules')
    
    # この時点で:
    # - pkg_resources.fixup_namespace_packagesが呼ばれる
    # - importlib.invalidate_caches()が呼ばれる
    
    import test_module  # テスト用モジュールがインポート可能に
```

テスト専用のモジュールを簡単に追加できます。

## 参考文献

<https://docs.pytest.org/en/stable/how-to/monkeypatch.html>

<https://docs.pytest.org/en/stable/reference/reference.html#monkeypatch>
