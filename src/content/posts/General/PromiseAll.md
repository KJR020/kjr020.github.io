---
title: "PromiseAll"
date: "2024-08-25T17:03:17+09:00"
draft: false
---

Promise.allについて調べたときのメモ

## 経緯

なぜか忘れたけど、Promise.allについて調べていた。
記事にまとめておく。

## 概要

`Promise.all()`は、JavaScriptの組み込みの静的メソッドである。
iterableなPromiseを入力として受取る。
それらのPromiseが全てresolveされた際に、新しいPromiseを返す。

## 使い方

mdnのデモを引用すると、以下のような構文となる。

``` javascript
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

Promise([promise1, promise2, promise3]).then((values) => 
  console.log(values)
);
// Expected output: Array [3, 42, "foo"]

```

### パラメーター

- `iterable` : Promiseの配列など、iterableなオブジェクト。

### 戻り値

- `Promise` : 全てのPromiseがresolveされた際に、resolveされるPromise。
  - 空のiterableを渡した場合 -> 即座にresolveされるPromiseを返す。
  - 全てのPromiseがresolveされた場合 -> resolveされた値を持つPromiseを返す。 \
    このとき、返されるPromiseのresolveされた順番によらず、引数のPromiseの順番になる。
  - 一つでもrejectされた場合は、即座にrejectされる。 \
    このとき、rejectされた理由は、最初にrejectされたPromiseの理由となる。

## 参考

- [mdn web docs](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [ECMAScript 2025 Language Specification](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise.all)
