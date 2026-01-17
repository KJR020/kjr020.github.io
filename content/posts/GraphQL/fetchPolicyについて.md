+++
title = 'FetchPolicyについて'
date = 2024-11-25T21:42:22+09:00
draft = true
tags = ['GraphQL']
+++

## FetchPolicyについて

GraphQLのクエリを実行する際に、
FetchPolicyというパラメータを指定しているのを見かけました。
今回は、このFetchPolicyについて調べてみました。

## FetchPolicyとは

- Apollo ClientでGraphQLのクエリを実行する際に指定するパラメータ
- キャッシュの利用方法を指定する
  - Apolloがキャッシュ機構を備えている
  - 4つのFetchPolicyがある
    - cache-first
    - cache-and-network
    - network-only
    - cache-only

- 参考
<https://www.apollographql.com/docs/react/data/queries>
<https://qiita.com/ryosuketter/items/398dbfddb9aae5eca5a9>
