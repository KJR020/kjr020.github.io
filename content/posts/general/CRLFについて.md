+++
title = 'CRLFについて'
date = '2024-08-25T17:06:03+09:00'
draft = false
tags = ['CRLF']
+++

### 背景

８月からWebエンジニアに転職し、業務でmacOSを使用することになった。  
学生時代ぶりのmacOSで、ターミナルの操作や環境構築に戸惑いを感じることが多い。
環境構築の際に、Windows環境で使用していた`.vimrc`をmacで使用したが、
CRLFに由来するエラーに遭遇した。

```shell
$  kjr020.github.io git:(main) ✗ vim
/Users/hoge/.vimrc の処理中にエラーが検出されました:
行    3:
E492: エディタのコマンドではありません: ^M
行    6:
E492: エディタのコマンドではありません: ^M
行    8:
```

今までCRLFについては、WindowsとLinuxでの改行コードの違いとして認識していたが、
macOSでCRLFが問題になることがあることを知らなかった。  
この機会に調べてみることにした

### CRLFとは

CRLFはCarriage Return Line Feedの略で、  
CR(Carriage Return)は復帰、(Line Feed)は改行のための制御文字である。
CRは行の先頭にカーソルを移動させる制御文字で、LFは次の行にカーソルを移動させる制御文字である。
macOS(unix系OS)では、LFのみを改行コードとして使用しているため、CRが処理されず問題になる

<https://developer.mozilla.org/ja/docs/Glossary/CRLF>
