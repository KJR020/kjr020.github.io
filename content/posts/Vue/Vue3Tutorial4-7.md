+++
title = 'Vue3の復習 tutorial-step4-7'
date = '2024-09-23T06:15:58+09:00'
draft = false
tags = ['Vue3']
+++

今度の案件でVue3を使うことになった
たしか１年ほど前に少しだけ触ったことがあるが、案件に備えてチュートリアルで復習する

## イベントリスナー `v-on`

<https://ja.vuejs.org/tutorial/#step-4>

- `v-on`ディレクティブを使って、イベントリスナーを追加できる
- `v-on`は`@`で省略できる

## フォームバインディング

<https://ja.vuejs.org/tutorial/#step-5>

- `v-on`,`v-model`を使うと双方向のデータバインディングができる
- いまさら気づいたが、`data`は関数を返す必要があるらしい
  - objectでもよいのでは？と思ったが、`data`はコンポーネントのインスタンスごとに異なるデータを持つため、関数を返す必要がある
  - objectを返すと、コンポーネントのインスタンスが共有されてしまう
- 逆に、`methods`はobjectを返す必要がある
  - これは、コンポーネントのインスタンスが共有されても問題ないためか

```vue
<script>
  export default {
    data: {
      return {
      text: ''
    }},
    }
    methods: {
      onInput(event) {
        this.text = event.target.value
      }
    },
    }
  }
</script>
<template>
  <input :value='text' @input="onInput">
  <p>{{ text }}</p>
</template>
```

## 条件付きレンダリング

- <https://ja.vuejs.org/tutorial/#step-6>
- これも復習

```vue
<script>
export default {
  data() {
    return {
      isVisible: true
    }
  },
  methods: {
    toggle() {
      this.isVisible = !this.isVisible
    }
  }
}
</script>

<template>
  <button @click="onClick">Toggle</button>
  <h1>Vue is awesome!</h1>
  <h1>Oh no 😢</h1>
</template>

```

## リストレンダリング

<https://ja.vuejs.org/tutorial/#step-7>

- `v-for`ディレクティブを使用すると配列を元にリストをレンダリングできる

```vue
<ul>
  <li v-for="item in items" :key="item.id">
    {{ todo.text }}
  </li>
</ul>
```

- リストを変更するには、２つの方法があるらしい
  - 配列の変更を追加する

    ```vue
    this.items.push(newItem)
    ```

  - 配列を新しい配列に置き換える

    ```vue
    this.items = this.items.filter(/* ... */)  
    ```
