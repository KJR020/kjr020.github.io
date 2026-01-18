+++
title = 'CORSに関するメモ'
date = '2024-08-25T17:03:17+09:00'
draft = false
tags = ['CORS']
+++

## 経緯

Djangoの本番環境を構築しているとき、CORSの設定をしないと、CORSエラーが発生しコンテンツが読み込めないことがあった。
CORSとは、Cross-Origin Resource Sharingの略で、異なるオリジン間でのリソース共有を許可するための仕組みらしいが、
あまり理解していなかったので、調べてみた。

## 概要

CORS(Cross Origin Resource Sharing)は、異なるオリジン間で安全にリソース共有するための仕組みである。(XSSやCSRFなどのセキュリティ上のリスクがあるためである。)
通常ブラウザでは、異なるオリジン間でのリソース共有はセキュリティ上の理由から制限されている。SOP(Same Origin Policy)という制約がある。
主に、APIリクエストや非静的ファイルのリクエストに適用される。

<https://developer.mozilla.org/ja/docs/Web/Security/Same-origin_policy>

### オリジンとは

そもそもオリジンについて、明確な定義を知らないと気付いた。
オリジンは、スキーマ、ホスト、ポートの組み合わせで識別される。
RFC6454に定義されている。

``` plaintext
https://www.example.com:8080
```

上記の例では、`https`がスキーマ、`www.example.com`がFQDN、`8080`がポートである。

### SOP(Same Origin Policy)

SOPは、異なるオリジン間でのリソース共有を制限するための仕組みである。
異なるオリジン間でのリソース共有は、クロスサイトスクリプティング(XSS)やクロスサイトリクエストフォージェリ(CSRF)などのセキュリティ上のリスクがあるため、制限されている。
セキュリティ的に外部のオリジンが信用できる場合,CORSによって制限を解除することができる。

## cors-headerを付与すると何が起こるのか

CORSヘッダーを付与すると、
リクエストの際にブラウザはCORSポリシーに従ってリクエストを送信する。
CORSポリシーは、リクエストを送信する際に、リクエストヘッダーに`Origin`を付与する。
サーバーは、リクエストヘッダーの`Origin`を見て、リクエストを許可するかどうかを判断する。

## 参考

<https://datatracker.ietf.org/doc/html/rfc6454>

<https://qiita.com/shun198/items/9ebf19d8fd2c412396dd>

<https://atmarkit.itmedia.co.jp/ait/articles/1311/26/news007.html>
