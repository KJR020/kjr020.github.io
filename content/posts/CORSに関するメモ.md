+++
title = 'CORSに関するメモ'
date = '2024-08-25T17:03:17+09:00'
draft = false
+++

## 経緯

Djangoの本番環境を構築しているとき、CORSの設定をしないと、CORSエラーが発生しコンテンツが読み込めないことがあった。
CORSとは、Cross-Origin Resource Sharingの略で、異なるオリジン間でのリソース共有を許可するための仕組みらしいが、
あまり理解していなかったので、調べてみた。

## 概要

CORS(Cross Origin Resource Sharing)は、異なるオリジン間で安全にリソース共有するための仕組みである。
主に、APIリクエストや非静的ファイルのリクエストに適用される。

### オリジンとは

そもそもオリジンについて、明確な定義を知らないと気付いた。
スキーマ、ホスト、ポートの組み合わせで識別されるものがオリジンらしい。
RFC6454に定義されている。

``` plaintext
https://www.example.com:8080
```

上記の例では、`https`がスキーマ、`www.example.com`がFQDN、`8080`がポートである。

## 参考

- <https://datatracker.ietf.org/doc/html/rfc6454>
- <https://qiita.com/shun198/items/9ebf19d8fd2c412396dd>
- <https://tech.asahi.co.jp/posts/20231005-bbf6>
- <https://qiita.com/takegons/items/706dc2d3d883d4a289bd>
- <https://atmarkit.itmedia.co.jp/ait/articles/1311/26/news007.html>
