+++
title = 'Vue3 Tutorial Step9 ライフサイクルとテンプレート参照'
date = '2024-09-27T07:43:52+09:00'
draft = false
tags = ['Vue3']
+++

## ライフサイクルとテンプレート参照

<https://ja.vuejs.org/tutorial/#step-8>

`onMounted`を例にライフサイクルフックを学習。ライフサイクルフックは、コンポーネントのライフサイクル（生成から削除されるまで）のイベントに応じて、コールバック関数を設定して処理を実行する。

```vue
<script setup>
import { onMounted, ref } from 'vue'

const pElementRef = ref(null)

onMounted(() => {
  pElementRef.value.textContent = "Mounted!"
})
</script>

<template>
  <p ref="pElementRef">Hello</p>
</template>
```

前回まで、`Options API`スタイルでチュートリアル学習を進めていたが、今回から`Composition API`スタイルで進めるようにした。

というか、そもそもVueには`Options API`と`Composition API`があることを知らなかった。ここまで学習してやっと気付いた。

昔、Vueを触った時には、`Options API`と`Composition API`の存在を知らず、雰囲気で書いていた。そのため、2つのAPIスタイルを混ぜてしまい、エラーが出まくってよく混乱していた。

Vue 2系では`Options API`のスタイルのみだったが、Vue 3系で`Composition API`スタイルが追加されたらしい。どうやらReactのスタイルに影響を受けているっぽい。
