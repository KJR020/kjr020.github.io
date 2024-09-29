+++
title = 'Vue3 Tutorial8 算出プロパティ'
date = '2024-09-26T07:02:19+09:00'
draft = false
tags = ['Vue3']
+++

## Vue3の復習 tutorial-step8  

<https://ja.vuejs.org/tutorial/#step-8>

- Vue.js
  - `Computed Property` 算出プロパティ
    - メソッドの戻り値をキャッシュして、依存する値が変わったときに再計算される
    - Reactでいうところの`useMemo`のようなもの

    ```vue
    export default {
      data() {
        return {
          newTodo: '',
          hideCompleted: false,
          todos: [
            { id: 1, text: 'Learn HTML', done: true },
            { id: 2, text: 'Learn JavaScript', done: true },
            { id: 3, text: 'Learn Vue', done: false }
          ]
        }
      },
      computed: {
        filteredTodos() {
          return this.hideCompleted
            ? this.todos.filter((t) => !t.done)
            : this.todos
        }
      },
      methods: {
        addTodo() {
          this.todos.push({ id: this.todos.length + 1, text: this.newTodo, done: false });
          this.newTodo = '';
        },
        removeTodo(todo) {
          this.todos = this.todos.filter((t) => t !== todo);
        }
      }
    }
    ```

    - チュートリアルのコードを見て、exportしているのがVueコンポーネントのオブジェクトであるということに今更気付いた
    - はじめ`data`の部分について「なぜオブジェクトキーのように見えないか」と疑問に思ったが、これは`data`オプションが関数として定義されるため
      - Vueでは、`data`はオブジェクトではなく、関数として定義される必要がある。
        - これは、各コンポーネントのインスタンスごとに異なるデータを持つことを可能にするためであるらしい
      - そのため、オブジェクトリテラルのように見えないが、実際には関数が定義され、戻り値としてオブジェクトを返している
    - 一方で、`methods`や`computed`はオブジェクトのプロパティとして定義されている
      - `methods`には、コンポーネントで使用する関数をプロパティとして定義し、イベントハンドリングや状態の変更を行う
      - `computed`もオブジェクトのプロパティであり、依存するデータが変更された場合にのみ再計算され、結果がキャッシュされる
