# WinSWとは

## 経緯

Windows Server上で実行するDjangoとnginxのプロセスをサービスとして登録したいと考えた。  
当初、NSSMを使用することを検討したが、セキュリティツールで弾かれた。  
開発も止まっている様子なので、WinSWを使うことにした。

## 概要

Windows Service Wrapperの略らしい。  
Windows上でサービスとしてプロセスを登録するためのツール。

## 参考

- <https://github.com/winsw/winsw>
- <https://kiririmode.hatenablog.jp/entry/20170407/1491490800>
- <https://qiita.com/moni-hide/items/fd26fb223f2d4736cf55>
- <https://www.rinsymbol.net/entry/2022/03/13/191249>
