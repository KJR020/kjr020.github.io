+++
title = 'git stash'
date = '2024-08-25T17:03:17+09:00'
draft = false
tags = ['Git']
+++

## 経緯S

コマンドラインから`git stash`しようとして  
使い方を忘れてしまった。ちゃんと覚えていなかった。
調べてみた

## git stash とは

## 使い方

git stash して退避した変更を再び反映する場合には、２種類の方法がある

```bash
git stash apply  // stashリストから削除せず適用
git stash pop //  変更を適用して,stashリストから削除して
```
