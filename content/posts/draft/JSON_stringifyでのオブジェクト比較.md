+++
title = 'JSON.stringify()でのオブジェクト比較について'
date = 2024-10-10T21:32:15+09:00
draft = false
+++

## 経緯

JSON.stringifyを使ってオブジェクトを比較しているコードに出会い、気になったので調べてみました。

そもそも何故わざわざJSON.stringifyを使ってオブジェクトを比較するのか
という疑問がありました。

調べてみると、以下の記事にあたりました。

- <https://qiita.com/kaeru333/items/eec2b2c204c61cc5e484>

上記記事の参考元をたどると、下記Javascript.infoの記事にあたったので、
そちらを参考にしました。

 <https://ja.javascript.info/object-copy>

JavaScriptでは、オブジェクトを比較する際には、参照のメモリアドレスを比較するため、値が同じでも異なるオブジェクトとして扱われるようです。

そのため、オブジェクトの比較を行う際には、JSON.stringifyを使ってオブジェクトを文字列に変換し、比較することがあるようです。

ただ、JSON.stringifyはオブジェクトの比較に使うのは適していないようです

- <https://qiita.com/8x9/items/218e24b7e6eea2446beb>

その理由としては、
文字列化した際にオブジェクトのプロパティの順番が変わることがあるため
ということらしいです。
