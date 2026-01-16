---
title: "gitでcommit userを変更する"
date: "2024-08-25T17:03:17+09:00"
draft: false
---

## 経緯

gitを使用していたとき、
「リモートリポジトリにpush済みのコミットの、ユーザー情報を修正したい」
ということがあった。
修正する方法を調べてみた

## コード

```bash
git filter-branch --env-filter '
OLD_EMAIL=[古いメールアドレス]
CORRECT_NAME= [新しい名前]
CORRECT_EMAIL= [新しいメールアドレス]
if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```
