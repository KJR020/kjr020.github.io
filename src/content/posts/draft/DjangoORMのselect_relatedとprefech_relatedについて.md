---
title: "Django ORMの`prefetch_related`と`select_related`について"
date: "2024-09-24T07:05:35+09:00"
draft: true
---

DjangoのORMについて、`prefetch_related`と`select_related`について調べたので、まとめる。

## 背景

Django ORMの使い方でprefetch_relatedとselect_relatedについて違いや使い所を理解していなかった。
この機会に調べてみる。

## 概要

概要の整理をする。
`prefetch_related`と`select_related`は、クエリセットのメソッドで、リレーションシップを持つモデルのデータを取得する際に使う。
前提として、Djangoにおいて`QuerySet`は遅延評価されるため、クエリが実行されるまでデータベースにアクセスされない。
`prefetch_related`と`select_related`は、クエリを実行する前に、リレーションシップを持つモデルのデータを取得するためのメソッドらしい。
N+1問題を解決するために使われることが多い。

そのうえで、`prefetch_related`と`select_related`の違いを理解して、使い方を覚えていきたい。

### `select_related`
