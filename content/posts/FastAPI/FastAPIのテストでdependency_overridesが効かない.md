+++
title = 'FastAPIのテストで`dependency_overrides`が効かない場合は、関数オブジェクトの同一性を確認する'
date = '2025-10-10T23:14:11+09:00'
draft = false 
tags = ['FastAPI']
+++

## TL;DR

FastAPIの`dependency_overrides`が効かない事態に遭遇しました。
原因は、テストとアプリケーションでインポートパスの不一致により依存関係が解決されていなかったことでした

- ポイント
  - FastAPIのDIは関数オブジェクトをキーにした辞書で依存関係を解決する
  - インポートパスの不一致（`api.db` vs `src.api.db`）すると、関数オブジェクトが同一にならない

## はじめに

FastAPIでテストを書く際、本番環境ではMySQLを使用していますが、テスト時には高速化のためインメモリのSQLiteを使いたいというケースがあると思います。

FastAPIでは`app.dependency_overrides`を使うことで依存関係を簡単に差し替えられるため、この機能を使ってデータベース接続を切り替えようとしました。

しかし、なぜか`dependency_overrides`が効かず、テスト用のSQLiteではなく本番のMySQLに接続しようとしてエラーになってしまいました。

## 問題: dependency_overridesが効かない

テストを実行すると、以下のようなエラーが発生しました：

```bash
FAILED test_main.py::test_create_and_read - sqlalchemy.exc.OperationalError:
(pymysql.err.OperationalError) (2003, "Can't connect to MySQL server...")
```

テスト用のSQLiteを使うように設定したはずなのに、本番のMySQLに接続しようとしていました。

以下のようなテストコードを書いていました。

```python
# test_main.py
from src.api.db import get_db, Base
from src.api.main import app

@pytest.fixture
async def async_client():
    # テスト用のSQLiteエンジンを作成
    async_engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    # テスト用のget_db関数を定義
    async def get_test_db():
        async with AsyncSession(async_engine) as session:
            yield session

    # 依存関係を差し替え
    app.dependency_overrides[get_db] = get_test_db

    async with AsyncClient(transport=ASGITransport(app=app)) as client:
        yield client
```

一方、ルーター側のコードは以下の通りでした。

```python
# task.py
from api.db import get_db

@router.get("/tasks")
async def list_tasks(db: AsyncSession = Depends(get_db)):
    return await task_crud.get_tasks(db)
```

「設定は正しいように見えるのに、なんでオーバーライドが効いてないんだろう...」と悩みました。

## 原因を調べる

### FastAPIのDIの仕組みを読む

原因を調べようにも、そもそもDIの仕組みがどうなっているのかを理解していなかったため、
まず`dependency_overrides`がどのような仕組みで機能しているか調べました。

公式ドキュメントを見ると、テスト時に依存関係を差し替える方法として`app.dependency_overrides`を使う例が紹介されていました。しかし、内部的にどう動作しているかまでは書かれていません。

そこで、FastAPIのソースコード（`fastapi/dependencies/utils.py`）を読んでみることにしました。

依存関係の解決は`solve_dependencies`という関数で行われており、依存関係の上書きは以下の部分で行われていました。

```python
# fastapi/dependencies/utils.py

async def solve_dependencies(
  ...
    sub_dependant: Dependant
    # 依存関係を再帰的に解決するため、依存の依存をループで処理
    for sub_dependant in dependant.dependencies:
        sub_dependant.call = cast(Callable[..., Any], sub_dependant.call)
        sub_dependant.cache_key = cast(
            Tuple[Callable[..., Any], Tuple[str]], sub_dependant.cache_key
        )
        call = sub_dependant.call # 呼び出している関数オブジェクト
        use_sub_dependant = sub_dependant # 最終的に実行される依存関数

        # dependency_overridesが適用される
        if (
            dependency_overrides_provider
            and dependency_overrides_provider.dependency_overrides
        ):
            original_call = sub_dependant.call
            call = getattr(
                dependency_overrides_provider, "dependency_overrides", {}
            ).get(original_call, original_call)
            use_path: str = sub_dependant.path  # type: ignore
            use_sub_dependant = get_dependant(
                path=use_path,
                call=call,
                name=sub_dependant.name,
                security_scopes=sub_dependant.security_scopes,
            )
```

辞書の`.get(original_call, original_call)`を使って、元の依存関数（`original_call`）をキーにして差し替え先を取得しています。

つまり、`dependency_overrides`辞書に登録した関数オブジェクトと、実際にエンドポイントで`Depends()`に渡された関数オブジェクトが同じオブジェクトである必要があるということがわかりました。

### 関数オブジェクトの同一性を確認

テストコードとルーターで使っている`get_db`が本当に同じオブジェクトなのか確認してみました。

```python
from api.db import get_db as db1
from src.api.db import get_db as db2

print(f'db1 id: {id(db1)}')  # 4353479744
print(f'db2 id: {id(db2)}')  # 4353482784
print(f'Same? {db1 is db2}')  # False
```

結果は`False`となり、別オブジェクトであることがわかりました。

最初はどこが違うのかわからなかったのですが、`api.db`と`src.api.db`という異なるインポートパスから取得していることに気づきました。

これが原因だったようです。

### なぜインポートパスが違うと別オブジェクトになるのか？

インポートパスが違うと別オブジェクトになることが原因とわかりましたが、なぜそうなるのか調べました。

理由は、Pythonのモジュールキャッシュの仕組みにありました。

- Pythonは`sys.modules`というグローバル辞書でインポート済みモジュールをキャッシュする
- このとき、インポートパス文字列がキーとなるようです

```python
sys.modules['api.db']      # キー1
sys.modules['src.api.db']  # キー2（別のキャッシュエントリ）
```

つまり
- 同じファイル（`todo_app/src/api/db.py`）を指していても、インポートパスが違えば別のモジュールとしてロードされる
- 別のモジュールになるため、別の名前空間を持つことになる
  - `api.db`の名前空間にある`get_db`
  - `src.api.db`の名前空間にある`get_db`
- 結果として、そのモジュール内で定義された関数も別のオブジェクトとして扱われる

ということのようです。
このあたりは、Pythonのimportシステムの仕様をもう少し学ぶ必要がありそうです。


## 解決

テストコードとルーターのインポートパスを`src.api.db`に統一して実行すると、正しくSQLiteに接続され、無事テストが成功しました。


## まとめ

今回の問題を通じて、以下のことを学びました。

- FastAPIの`dependency_overrides`は関数オブジェクトをキーにした辞書で依存を管理している
- Pythonでは異なるインポートパスで同じモジュールをインポートすると別オブジェクトになる
  - `sys.modules`のキーはインポートパス文字列なので、同じファイルでもパスが違えば別物として扱われる

## 参考

<https://fastapi.tiangolo.com/advanced/testing-dependencies/>
<https://docs.python.org/3/library/sys.html#sys.modules>
<https://docs.python.org/3/reference/import.html>
