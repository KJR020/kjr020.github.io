---
title: "Svelte Reactivity Tutorial Notes"
date: "2024-09-22T05:39:36+09:00"
draft: false
---

Svelteの学習メモ。
<https://learn.svelte.jp/tutorial/updating-arrays-and-objects>の内容

- Svelteのリアクティビティ
  - Svelteではリアティビティは代入によってトリガーされる
    -`push`や`pop`などのメソッドを使うと、配列の内容が変更されたことをSvelteが検知できない
      - これらのメソッドを使う場合は、配列を再代入する必要がある
        - 値を再代入する
        ```js
        let numbers = [1, 2, 3];
        numbers.push(4);
        numbers = numbers;
        ```

        - スプレッド演算子を使う
        ```js
        let numbers = [1, 2, 3];
        numbers = [...numbers, 4];
        ```
