# Django入門メモ

djangoのチュートリアル実践メモ

## はじめてのDjangoアプリ作成、その１

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("polls/", include("polls.urls"))
    path("admin/", admin.site.urls),
]
```

include関数は、URLconfへの参照が可能。include()に遭遇すると、
そのポイントまでに一致したURLの部分を切り落とし、次の処理のために残りの文字列をインクルードされたURLconfへ渡す
背景にある考えは、URLをプラグ&プレイ可能にすることらしい
pollsは独自のURLconfを持っている

## 疑問

- URLConfってなんだ？
  - URL configの略っぽい。URLconf内の定数などを参照するということか？どこで定義されるのか？
- ディスパッチャ
  - プログラム内で、特定の処理を実行するために、適切なコードや関数を呼び出すものらしい
  - 「急いで送る」という意味らしい。[参考](https://p-cs.work/interrupt/)
  - イベントハンドラと何が違うのか？気になったので調べた
    - イベントハンドラーにイベントを転送するのが、ディスパッチャ

## 参照

1. https://p-cs.work/interrupt/
