+++
title = 'Vue3Tutorial14'
date = 2024-10-11T22:50:50+09:00
draft = false
+++

今回は、Vue3のチュートリアルのStep14の`slot`についてです

- [Slot](https://ja.vuejs.org/tutorial/#step-14)

## Slotとは

スロットは, 親コンポーネントから子コンポーネントにコンテンツを挿入するための機能です。
スロットを経由して、親コンポーネントから子コンポーネントにコンテンツを挿入することができます。

## Slotの使い方

Slotは`<slot>`タグを使うことで、親コンポーネントから子コンポーネントにコンテンツを挿入することができます。

```vue
// ChildComponent.vue
<template>
  <slot>Fallback Content</slot> // Fallback Content:親コンポーネントからコンテンツが渡されなかった場合に表示されるデフォルトのコンテンツ
</template>
```

親コンポーネントで`<ChildComponent>`タグで囲んだ部分が、`<slot>`タグに挿入されます。

```vue
// App.vue
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const msg = ref("Hello, from parent!")
</script>

<template>
  <ChildComponent>
    {{ msg }}
  </ChildComponent>
</template>
```

![alt text](image.png)

ここまで、Vue3のチュートリアルのStep14の`slot`についてでした。
