---
title: "SQLServerの認証方式"
date: "2024-08-25T17:03:17+09:00"
draft: false
---

## 経緯

デプロイ先サーバーの認証情報に関して、聞き取りをした。
その際に、SQL Serverの認証方式について、どの認証方式なのか？曖昧なまま話していた。
そもそも、認証方式として何種類くらいあるのかも、よくわかってない。
SQL Serverの認証情報を調べてみた。

## SQL Serverの認証方式の種類

大きく  `Windows認証` と `SQL Server認証` という2つの認証方式がある。

- SQL Server認証 (SQL Server Authentication)
  - SQL Serverのユーザー名とパスワードを使用して認証する方法
- Windows統合認証
  - Windows資格情報を使用する
  - Active Directory ユーザーアカウントを使用して認証も可能

## 参考

- <https://learn.microsoft.com/ja-jp/sql/relational-databases/security/choose-an-authentication-mode?view=sql-server-ver16>
- <https://www.kwbtblog.com/entry/2019/10/11/030233>
- <https://qiita.com/kazumatsukazu/items/d754457712963c447a50>
