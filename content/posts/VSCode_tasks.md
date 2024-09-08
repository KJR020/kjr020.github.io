+++
title = 'VSCodeのtaskについて調べた'
date = '2024-08-25T17:03:17+09:00'
draft = false
+++

## 経緯

VSCode上でTypeScriptのデバッグをしたいと思って調べた。
やり方として、launch.json上で、TypeScriptのコンパイルするtaskを定義して、  
デバッグ前に呼び出し実行させる必要があるという事を学んだ。  
taskについてよく知らなかったため調べてみた。

## Taskとは？

VSCodeには、コマンドライン上の一連の作業をコードとして定義し、呼出せるTask機能があるらしい。  
今のところ理解した情報は以下の通り

- `tasks.json`上で定義できる
- デバッグ前に呼び出して実行できる(`launch.json`に"preLaunchTask"として設定する)

印象としては、GitHub ActionsやPower Automateと似ていると思った。  
細かい記法など調べながらであれば、なんとか使えそう。

## 参考

- [公式ドキュメント](https://code.visualstudio.com/docs/editor/tasks)
- [2022-09-21-VSCodeのTasks機能を使ってまとめてコマンドを実行しよう - 心のデブを信じろ](https://kenpos.dev/2022-09-21-vscodeのtasks機能を使ってまとめてコマンドを実行しよう/)
- [【VS Code】tasks.jsonで決まった作業を自動化する](https://dev.classmethod.jp/articles/tasks-json-vscode-automation/)
