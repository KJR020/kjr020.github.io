---
title: "HTMLモックを保存し直したら要素が増殖した"
date: "2026-08-27T00:00:00+09:00"
draft: false
tags: [Web, フロントエンド, JavaScript]
description: "AIで作ったHTMLモックを保存し直した際に起きた要素の重複をきっかけに、普段は宣言的UIによって意識することの少ないDOMの初期化処理について考えたことをまとめます。"
---

最近、Claude Codeで簡易的なHTMLモックを作ることがあります。

そのモックをブラウザからHTMLとして保存し直したところ、ページを開くたびに一部の要素が増えていくことがありました。

原因は、JavaScriptで描画した後のDOMと、同じ要素を追加する初期化処理が、一つのHTMLに同居していたことでした。この記事では、この挙動をきっかけに、普段はあまり意識していなかったDOMの初期化処理について考えたことを書きます。

## HTMLを開くと要素が増えた

作っていたのは、動作確認に使うための簡単なHTMLモックです。一部の要素はHTMLに直接書かず、ページを開いたときにJavaScriptで生成していました。

ブラウザ上では想定どおりに表示されていたため、ブラウザの「名前を付けて保存」で、その状態をHTMLとして保存しました。ところが、保存したHTMLをもう一度開くと、JavaScriptで生成していた要素が二重に表示されました。

さらにその状態で保存して開き直すと、同じ要素がまた追加されます。開くたびに要素が増えていく状態です。

## 描画済みのDOMに初期化処理が再実行されていた

原因を調べると、保存したHTMLには、JavaScriptの実行によって追加された要素がすでに含まれていました。その一方で、ページを開いたときに要素を追加するJavaScriptも残っています。

今回の状況を単純化すると、次のようなHTMLです。

```html
<!doctype html>
<html lang="ja">
  <body>
    <div id="app"></div>

    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const message = document.createElement("p");
        message.className = "generated-message";
        message.textContent = "JavaScriptで追加した要素";

        document.querySelector("#app").append(message);
      });
    </script>
  </body>
</html>
```

私の環境では、次の手順で同じ状態になりました。

1. HTMLをブラウザで開く
2. 要素が描画された状態で「名前を付けて保存」を実行する
3. 保存したHTMLを開く

保存したHTMLには、JavaScriptによって追加された要素が含まれていました。

```html
<div id="app">
  <p class="generated-message">JavaScriptで追加した要素</p>
</div>
```

ブラウザや保存形式によって、保存される内容は異なる可能性があります。今回の環境では、描画済みの要素と、それを追加するJavaScriptの両方が保存されていました。

そのため、保存したHTMLを開くと、次のことが起きていました。

1. 描画済みの要素を含んだHTMLが読み込まれる
2. 初期化処理が実行される
3. 同じ要素がDOMへもう一度追加される

最初のHTMLが空であることを前提にした初期化処理を、すでに描画済みのHTMLに対して実行していたわけです。

今回の単純なモックでは、初期化時に対象の要素がすでに存在するか確認し、存在する場合は追加しないようにしました。単純化すると、次のような修正です。

```js
document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("#app");

  if (app.querySelector(".generated-message")) {
    return;
  }

  const message = document.createElement("p");
  message.className = "generated-message";
  message.textContent = "JavaScriptで追加した要素";

  app.append(message);
});
```

これで、同じ初期化処理が再度実行されても要素は重複しなくなりました。

別の方針として、コンテナの中身を先に消してから作り直す方法もあります。例えば、この初期化処理だけが `#app` の中身を管理しているなら、`app.append(message)` の代わりに `app.replaceChildren(message)` とすることで、実行するたびに同じ状態へ戻せます[^3]。ただし、コンテナ内の既存要素をすべて置き換えるため、使える場面は限られます。

## 初期化処理に目を向けるきっかけになった

今回のモックはClaude Codeに作らせたもので、私自身はコードの細かいところまで読んでいませんでした。画面上で期待どおりに動いていればよく、ページを開いたときにどのような処理が走っているのかも、ほとんど意識していませんでした。

要素が増殖する原因を調べたことで、ページを開いたときにDOMへ要素を追加する初期化処理があることや、すでに描画された状態に対して同じ処理を実行するとどうなるのかに目が向きました。

今回のようなコード自体は単純なものですが、普段の開発では、こうしたDOMの初期化や更新処理を直接書く機会はあまりありません。なぜ普段これを意識することが少ないのかを考えると、ReactやVueのような宣言的UIを使っていることも大きそうです。

## 宣言的UIによって意識せずに済んでいたこと

普段はReactやVueを使うことが多く、DOMへ要素を直接追加するコードを書く機会はあまりありません。「どのようなUIであるべきか」を状態やテンプレートとして記述し、実際のDOMへの反映はフレームワークに任せています[^1][^2]。

そのため、既存のDOMに対して要素を追加したり、現在の状態を確認しながらDOMを更新したりといった処理を、自分で意識する機会は少なくなっています。

もちろん、宣言的UIを使えば副作用について考えなくてよいわけではありません。外部APIの呼び出しやイベントリスナーの登録など、DOMの描画以外の処理は別に考える必要があります。

今回の挙動を通して気づいたのは、宣言的UIがこうした問題をなくしているというより、DOMを現在の状態から望ましい状態へ反映する部分を、普段はフレームワークに任せているということでした。

AIに生成させた素のJavaScriptで思わぬ挙動に遭遇したことで、普段はあまり意識していないUIの裏側の処理について考えるきっかけになりました。

## まとめ

ブラウザから保存したHTMLで要素が重複した原因は、描画済みのDOMに対して、要素を追加する初期化処理がもう一度実行されていたことでした。

単純なバグでしたが、AIに生成させたコードだったこともあり、原因を調べるまではページを開いたときにどのような初期化処理が走っているのかをほとんど意識していませんでした。

普段ReactやVueで宣言的にUIを書いていると、DOMをどのように更新して望ましい状態にするかはフレームワークに任せられます。今回のバグは、その普段あまり意識しない部分に目を向けるきっかけになりました。

[^1]: React公式ドキュメントでは、個々のUI要素を直接操作する代わりに、コンポーネントが取り得る状態を記述する方法として説明されています。[Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)（2026年8月確認）
[^2]: Vue公式ドキュメントでは、テンプレートによって描画されるDOMとコンポーネントのデータを宣言的に結び付けると説明されています。[Template Syntax](https://vuejs.org/guide/essentials/template-syntax.html)（2026年8月確認）
[^3]: `Element.replaceChildren()` は、既存の子要素を指定したノードで置き換えるDOM APIです。[Element: replaceChildren() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren)（2026年8月確認）
