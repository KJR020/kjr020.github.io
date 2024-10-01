+++
title = 'Vue3 Tutorial 11-14 ChildComponent'
date = 2024-09-30T07:09:08+09:00
draft = false
tags = ['Vue3']
+++

## おさらい

Vue3のチュートリアルを進めています。
前回は、VueのComponentの`watch`について学習しました。
Reactでいう`useEffect`のようなもので、
リアクティブな値の変化を監視して、副作用を伴う関数を実行することができる機能です。

[前回の記事](../Vue3Tutorial10.md)

## Child component

今回は最終回で、チュートリアル11-12までまとめて学習します。
ChildComponentと`Props`について学習します。
チュートリアルのリンクは以下です。

- [ChildComponent](https://ja.vuejs.org/tutorial/#step-11)
- [Props](https://ja.vuejs.org/tutorial/#step-12)

### Step11 Child Component

Vueでは、コンポーネントの再利用するための仕組みが用意されています。
それが、Child Componentです。
子コンポーネントを作成して、親コンポーネントで使用することができます。

実際のチュートリアルのコードを見てみます
Composition APIとSFC(Single File Component)を前提としています。

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

### Props

上記の例では、子コンポーネントが固定値を表示しているだけでした。
「再利用する」という事を考えると、動的に表示内容を変更したいとなるはずです。
そこで、Propsを使用します。
親コンポーネントから子コンポーネントに値を渡して利用することができます。
`defineProps`を使用してpropsを定義することができます。(Composition APIかつSFCの場合)

```vue
<!-- ChildComponent.vue -->
<script setup>
const props = defineProps({
  msg: String
})
</script>

<template>
  <h2>{{ msg | 'No props passed yet '}}</h2> // デフォルト値を設定. msgがない場合はNo props passed yetが表示される
</template>
```

templateの中で`{{ msg | 'No props passed yet '}}`として、propsの値を表示しています。
`msg`がない場合は`No props passed yet`が表示されます。

親コンポーネントから、propsに値を渡すには、
v-bindディレクティブを使用して、propsを渡します。

App.vue

```vue
<!-- App.vue -->
<script setup>
import { ref } from 'vue'
import ChildComp from './ChildComp.vue'

const greeting = ref('Hello from Parent!')
</script>

<template>
  <ChildComponent :msg="greeting" /> // :msg="greeting"でpropsを渡す
</template>
```

#### defineProps

ぱっと見`defineProps`は、importされていないことに引っかかりました。
コンパイラーマクロというもので、`<script setup>`が処理される際に、コンパイルされるそうです。  
型推論をサポートするために、用意されているAPIのようです。

<https://ja.vuejs.org/api/sfc-script-setup#defineprops-defineemits>

次回は、子コンポーネントから親コンポーネントにイベントを送信するEmitについて学習します。
