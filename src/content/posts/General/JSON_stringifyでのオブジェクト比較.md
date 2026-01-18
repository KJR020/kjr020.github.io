---
title: "JSON.stringify()でのオブジェクト比較について"
date: "2024-10-10T21:32:15+09:00"
draft: false
---

## 経緯

業務でJSON.stringify を使ってオブジェクトを比較しているコードに出会い、
「なぜわざわざ JSON.stringify を使ってオブジェクトを比較するのか？」という疑問があり、気になったので調べてみました。
調べてみると、以下の記事にあたりました。

- <https://qiita.com/kaeru333/items/eec2b2c204c61cc5e484>

この記事の参考元をたどると、下記のJavaScript.infoの記事に行き着いたので、そちらを読んでみました。

- <https://ja.javascript.info/object-copy>

## オブジェクト比較における JSON.stringify の役割

JavaScriptでは、オブジェクトを比較する際、参照されているメモリアドレスを比較するため、たとえ値が同じでも異なるオブジェクトとして扱われます。  
具体的に、次のようなコードでは false が返されます。

```javascript
const obj1 = { a: 1 };
const obj2 = { a: 1 };

console.log(obj1 === obj2); // false
```

このため、オブジェクトの比較を行う際に、`JSON.stringify`を使ってオブジェクトを文字列に変換し、その文字列同士を比較するという方法がよく使われるようです。

## JSON.stringify を使う際の問題点

ただ、上記の方法には問題があるようで、下記の記事で指摘されていました。
`JSON.stringify`をオブジェクトの比較に使うのはあまり推奨されない方法ということです。

- <https://qiita.com/8x9/items/218e24b7e6eea2446beb>

いくつかの理由があるようですが、
特に大きな問題はオブジェクトのプロパティの順番が変わる可能性があることだと私は理解しました。
例えば、次のような場合です。

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 2, a: 1 };

console.log(JSON.stringify(obj1) === JSON.stringify(obj2)); // false
```

この例では、`obj1`と`obj2`は同じ値を持っていますが、プロパティの順番が異なるため、JSON.stringify では同一として扱われません。

## 他の手段について

代替の方法として、`lodash`の`isEqual`メソッドを使う方法が良さそうです。
また今後追記したいと思います。
