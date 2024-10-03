+++
title = 'WinSWとは'
date = '2024-08-25T17:03:17+09:00'
draft = false
+++

## 経緯

Windows Server上で実行するDjangoとnginxのプロセスをサービスとして登録したいと考えた。  
当初、NSSMを使用することを検討したが、セキュリティツールで弾かれた。  
開発も止まっている様子なので、WinSWを使うことにした。

## 概要

Windows Service Wrapperの略らしい。  
Windows上でサービスとしてプロセスを登録するためのツール。

サービスとして登録するための設定ファイル(xml形式)を作成し、`install`コマンドを実行することで、サービスとして登録できる。
使い勝手としては、手頃で良さそう。
いつかまとめる...かも

## 参考

- <https://github.com/winsw/winsw>
- <https://kiririmode.hatenablog.jp/entry/20170407/1491490800>
- <https://qiita.com/moni-hide/items/fd26fb223f2d4736cf55>
- <https://www.rinsymbol.net/entry/2022/03/13/191249>
