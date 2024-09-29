+++
title = 'Vue3 Tutorial 11-14 ChildComponent'
date = 2024-09-30T07:09:08+09:00
draft = true
tags = ['Vue3']
+++

## おさらい

Vue3のチュートリアルを進めています。
前回は、VueのComponentの`watch`について学習しました。
Reactでいう`useEffect`のようなもので、
リアクティブな値の変化を監視して、副作用を伴う関数を実行することができる機能でした。

[前回の記事](../Vue3Tutorial10.md)

## Child component

今回は最終回で、チュートリアル11-14までまとめて学習します。
内容としては、ChildComponentとその関連機能として`Props`, `Emit`, `Slots`について学習します。
チュートリアルのリンクは以下です。

- [ChildComponent](https://ja.vuejs.org/tutorial/#step-11)
- [Props](https://ja.vuejs.org/tutorial/#step-12)
- [Emit](https://ja.vuejs.org/tutorial/#step-13)
- [Slots](https://ja.vuejs.org/tutorial/#step-14)

### Step11 Child Component

Vueでは、コンポーネントの再利用するための仕組みが用意されています。
子コンポーネントを作成して、親コンポーネントで使用することができます。

実際のチュートリアルのコードを見てみます
前回同様にComposition APIを扱います。

#### Child Componentの作成

```vue
<!-- ChildComp.vue -->
<template>
  <h2>A Child Component!</h2>
</template>
```

#### 親コンポーネントでの使用

親コンポーネントの`App.vue`から子コンポーネントをimportして
template内で使用することができます。

```vue
<!-- App.vue -->
<script setup>
import ChildComp from './ChildComp.vue'
</script>

<template>
  <ChildComp />
</template>
```

簡単ですね。

### Props

次は、子コンポーネントに値を渡して利用する方法について学習します。
これは、関数の引数のように値を渡すことで、子コンポーネントを動的に変更することができます。
