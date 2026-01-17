+++
title = 'Reactのstate管理'
date = '2024-08-25T17:03:17+09:00'
draft = false
tags = ['React']
+++

## 経緯

転職が決まりWEBエンジニアとして働くことになった。
転職先では、フロントエンド・バックエンドと別れずに開発を行うらしい。Reactについて学習を始めた。
Reactを学習していて、stateの管理について学んだことをまとめる。

## stateとは

Reactのコンポーネントには、stateという概念がある。
stateは、コンポーネント内で変更される値を管理するためのものである。
stateが変更されると、Reactは自動的に再レンダリングを行う。

Reactでは、このstateの値を変更するために、`setState`メソッドを使用する。

```javascript
const [count, setCount] = useState(0);
```

のように、`useState`フックを使用してstateを宣言し、`setCount`関数を使用してstateの値を変更する。
stateは、基本的にconstで宣言され、変更するためには`setCount`関数を使用する。

また、ReactではAtomic　Designの考え方が取り入れられており、コンポーネントは小さなコンポーネントに分割されることが推奨されている。
そのため、コンポーネント間でstateを共有するためには、親コンポーネントから子コンポーネントにpropsを渡すことが一般的である。
しかし、コンポーネントが多くなると、propsの受け渡しによるstateの管理が複雑になるため、stateの管理が難しくなる。
そのため、stateの値をグローバルに管理するための仕組みが存在する
Context APIやReduxなどがあるらしい。

## Context API

Context APIは、Reactの公式で提供されているstateのグローバル管理ライブラリである。
Context APIを使用することで、コンポーネント間でstateを共有することができる。
