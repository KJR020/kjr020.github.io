+++
title = 'Pythonの組み込み関数superについて'
date = '2024-09-03T21:51:30+09:00'
draft = false
tags = ['Python']
+++

Python組み込み関数のsuperについて調べたことをまとめる

## 経緯

super()について、ライブラリの実装を読んでいると時々目にしていたが、  
自分では使ったことがなかったので、中身の処理をよく理解していなかった。
DjangoのCreateViewの実装を理解したいと思い、その一環でsuper()について調べてみることにした。

## 調べてみる

まずは公式ドキュメントを読んでみる

> class super(type, object_or_type=None)  
> メソッドの呼び出しを type の親または兄弟クラスに委譲するプロキシオブジェクトを返します。  
> これはクラスの中でオーバーライドされた継承メソッドにアクセスするのに便利です。

proxyオブジェクトを渡すらしいが、まだ良くわかってない
super().get()とかsuper().post()とか具体的に動かしてみるとする

```python
class Parent:
    def greet(self):
        """親クラスの挨拶メソッド"""
        print("Hello from Parent")


class Child(Parent):
    def greet(self):
        """子クラスの挨拶メソッド"""
        print("Hello from Child")
        super().greet()  # 親クラスのメソッドを呼び出す


# インスタンスの生成
parent_instance = Parent()
child_instance = Child()

# 挨拶を表示
child_instance.greet()
```

出力

```shell
> Hello from Child
> Hello from Parent
```

super()は、親クラスのメソッドを呼び出すための関数であるということだ。

super()の引数がどこからわたっているのか不思議だったが、  
どうやら自動的にClassとselfが渡されるらしい

```python
class C(B):
    def method(self, arg):
        super().method(arg)    # This does the same thing as:
                               # super(C, self).method(arg)
```

どうやって渡されているのかは、下記記事で調査されていた

<https://shomah4a.hatenadiary.org/entry/20120316/1331864078>

あまり理解できていないので、いずれもう少し深堀りしてみたい
