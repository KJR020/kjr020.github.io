+++
title = 'Vue3 Tutorial Step13 Emit'
date = 2024-10-01T21:36:34+09:00
draft = false
tags = ['Vue3']
+++

今回は、Vue3のチュートリアルのStep13の`emit`についてです

<https://ja.vuejs.org/tutorial/#step-13>

## Emitとは

Emitとは、Vue3のコンポーネントで子コンポーネントからイベントを発火するための機能です。
イベントを発火させ、親コンポーネントでそのイベントから処理をトリガーすることができます。

## Emitの使い方

子コンポーネントで`defineEmits`を使って、イベントを定義します。

```vue
// ChildComponent.vue
<script setup>
const emit = defineEmits(["response"])

emit("response", "Hello, from child!") // 第一引数はイベント名、第二引数はイベントリスナーに渡す値
</script>
```

コンポーネントで定義したイベントを親コンポーネントで受け取るためには、`v-on`ディレクティブを使います。

```vue
// App.vue
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childMsg = ref("") // 子コンポーネントからのメッセージを保持するリアクティブな変数
</script>

<template>
  <ChildComponent @response="(msg) => childMsg = msg" />
  <p>{{ childMsg }}</p>
</template>
```

次回は、Vue3のチュートリアルのStep14の`slot`についてです
