---
title: "Vue3 Tutorial Step10 watch"
date: "2024-09-29T14:56:37+09:00"
draft: false
tags:
  - "Vue3"
---

## Vue3 Tutorial Step10 watch

watchについて学習した内容です。

今回から文体を変えてみました。  
理由としては、「だ。である。」調のより「です。ます。」調の文章を書くときのほうが、「人に説明するつもりで書く」という意識が働くと感じたためです。
より話し言葉に近い文体だからか、意識に差があるように感じます。

### watch について

`watch`についての概要です。
Tutorialの内容を自分が咀嚼した、まとめたものです。
私の解釈がふくまれているため、正確な情報は公式ドキュメントを参照してください。

- watcherはVueのリアクティブシステムの中心的な機能のひとつ
- リアクティブな値の変化を監視して、副作用を伴う関数を実行することができる
- `watch`メソッドでは、監視するリアクティブな値(`ref`メソッドを使って定義した変数)と、値が変化した時に実行されるコールバック関数を設定する

チュートリアルでは、
その一例としてwatchを使用して監視対象が変更した際に、APIからデータを取得する例を示しています。

大まかな流れは以下の通りです。

1. button要素がクリックされると、リアクティブな`todoId`の値がインクリメントされる
2. `todoId`の値が変化した時に、`fetchData`関数が実行される
3. `todoId`はボタンのclickイベントでインクリメントされ、`fetchData`関数がトリガーされる
4. `fetchData`関数内でREST APIのエンドポイントに対してgetリクエストを送信
5. `todoId`に対応するデータを取得して、`todoData`に格納する
6. `todoData`の変化を監視して、`todoData`が変化した時に、`todoData`を表示する

チュートリアルのコードを引用します。

```vue
  <script setup>
  import  { ref, watch } from 'vue'

  const todoId = ref(0)
  const todoData = ref(null)

  async function fetchData() {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
    )
    todoData.value = await response.json()
  }

  fetchData()

  watch(todoId, (todoId) => {
    fetchData();
  })

  <template>
    <p>Todo id: {{ todoId }}</p>
    <button @click="todoId++" :disabled="!todoData">Fetch Next</button>
    <p v-if="todoData">Loading...</p>
    <pre v-else>{{todoData}}</pre>
  </template>
```

### Reactとの比較

ここまで学習した内容を更に深めるために、Reactとの比較をしてみました。

`watch`関数はReactで言うuseEffectのようなものが該当すると思われます。

理解を深めるために、ReactとVueの比較を調べようと思い、下記の記事にあたりました。
副作用の項で、Reactの`useEffect`とVueの`watch`の違いについて触れられていました。

- <https://zenn.dev/poteboy/articles/ce47ec05498cfa>

Reactの`useEffect`とVueの`watch`は、
役割としてはどちらもリアクティブな値の変動によって副作用を伴う関数をトリガーするものですが、挙動に違いがあるようです。
そしてその違いは、実行タイミングの違いにあるようです。
Reactの`useEffect`では、マウントされた時点で副作用が実行されるのに対して、Vueの`watch`は依存するリアクティブな値が変化した時にはじめて副作用が実行されるとのことです。

なので、Vueには`watchEffect`というAPIが存在し、`watchEffect`はVueの`watch`と同じタイミングで副作用が実行されるとのことです。

次回は、TutorialのStep11を学習します。
