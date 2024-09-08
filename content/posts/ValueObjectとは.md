+++
title = 'ValueObjectとは'
date = '2024-08-29T07:43:34+09:00'
draft = false
+++

### 経緯

<https://zenn.dev/339/articles/e3c174fdcc083e>

を読んでいて、バリューオブジェクトの理解が曖昧だなと思ったので再確認  
記事によると、基本的には、くまぎさんの書いたwikiの翻訳を信じたら良いらしい  
確かに、くまぎさんの書いたwikiなら信頼できそうだなと思った

### 調べてみる

リファレンスもみてみる  

>^ Fowler, Martin (2003年). “Value Object”. Catalog of Patterns of Enterprise Application Architecture. Martin Fowler (martinfowler.com). 2011年7月17日閲覧。

第一参考文献にある、Martin Fowler氏の説明を読む

Martin Fowler氏のサイトによると、
> Value Object
> A small simple object, like money or a date range, whose equality isn't based on identity.
>
> With object systems of various kinds, I've found it useful to distinguish between reference objects and Value Objects. Of the two a Value Object is usually the smaller; it's similar to the primitive types present in many languages that aren't purely object-oriented.

とある

### 自分の理解

自分の理解としては、  

- ValueObjectは、小さなシンプルなオブジェクトで、同等性が同一性に基づくものではない。
- ここで言うidentityは,同一性で、それがメモリの位置や識別子に値する。  
  等価性を満たすのに、必ずしも同一性を持つ必要がない

DDDで提唱された概念の一つで、ドメインモデルを表現するために使われるらしい

### 参考

- <https://ja.m.wikipedia.org/wiki/Value_object>
- <https://martinfowler.com/eaaCatalog/valueObject.html>

# ValueObjectとは

## 経緯

<https://zenn.dev/339/articles/e3c174fdcc083e>

を読んでいて、バリューオブジェクトの理解が曖昧だなと思ったので再確認  
記事によると、基本的には、くまぎさんの書いたwikiの翻訳を信じたら良いらしい  
確かに、くまぎさんの書いたwikiなら信頼できそうだなと思った

## 調べてみる

リファレンスもみてみる  

>^ Fowler, Martin (2003年). “Value Object”. Catalog of Patterns of Enterprise Application Architecture. Martin Fowler (martinfowler.com). 2011年7月17日閲覧。

第一参考文献にある、Martin Fowler氏の説明を読む

Martin Fowler氏のサイトによると、
> Value Object
> A small simple object, like money or a date range, whose equality isn't based on identity.
>
> With object systems of various kinds, I've found it useful to distinguish between reference objects and Value Objects. Of the two a Value Object is usually the smaller; it's similar to the primitive types present in many languages that aren't purely object-oriented.

とある

## 自分の理解

自分の理解としては、  

- ValueObjectは、小さなシンプルなオブジェクトで、同等性が同一性に基づくものではない。
- ここで言うidentityは,同一性で、それがメモリの位置や識別子に値する。  
  等価性を満たすのに、必ずしも同一性を持つ必要がない

という感じだ。

## 参考

- <https://ja.m.wikipedia.org/wiki/Value_object>
- <https://martinfowler.com/eaaCatalog/valueObject.html>
