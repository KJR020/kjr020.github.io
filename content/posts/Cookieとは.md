+++
title = 'Cookieとは'
date = '2024-08-25T17:03:17+09:00'
draft = false 
tags = ["Cookie", "Web", "HTTP"]
+++

技術面接に関して、どのような事を聞かれるのか調べていた
たまたまCookieについて目に入ったとき、説明できる自信がなかった。

ざっくりと、考えてみた
「サーバーとブラウザで通信したセッションに関する情報を記録し、
再度アクセスしたときに状態を復帰できるように、保存する仕組み」

Cookieについて、十分に理解してなかったと気づいたので、調べてみた。

## Cookieとは？

理解はおおよそ合っている。
HTTP Cookieとも呼ばれるらしい。
ユーザーがウェブサイトにアクセスした時にブラウザに送られてくるテキストデータ。  
Edgeでは、下記のpathに存在する  
`C:\Users\<ユーザー名>\AppData\Local\Microsoft\Edge\User Data\Default\Cookies`  
ユーザーがアクセスしたときの情報を保存しておいて、再度アクセスしたときに状態を復元できる  

セッションCookieとパーシステントCookieがあるらしい。  
セッションCookieは一時的なもので、ブラウザを閉じると削除される。  
パーシステントCookieは、有効期限が設定されていて、有効期限まではデバイスに残る。

## 参考

- [面接で聞かれた技術的質問🚀](https://zenn.dev/hidebon0630/articles/75022374e28cdf)
- [Googleのポリシーと規約](https://policies.google.com/technologies/cookies?hl=ja)
- <https://learn.microsoft.com/ja-jp/microsoft-edge/devtools-guide-chromium/storage/cookies>
