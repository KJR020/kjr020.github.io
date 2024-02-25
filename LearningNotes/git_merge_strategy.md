# Merge Strategyについて
Git を使っていて、 'ort' strategyについて気になった。
それまであまり気にしていなかったが、調べてみた
```
$ git merge lesson38
Merge made by the 'ort' strategy.
 src/index.js | 23 ++++++++++++++++++-----
 1 file changed, 18 insertions(+), 5 deletions(-)
```

## Merge Strategyとは？
マージ実行時のバックグラウンドのメカニズムらしい。
マージ(git pull or git merge)を実行した時に、バックエンドで動くマージ処理の種類らしいが選べるということ。

optionで指定もできるが、自動的に選択されるもので、
'ort' strategyがデフォルトになっている。

## 


## 参考
- https://git-scm.com/docs/merge-strategies
- https://www.atlassian.com/ja/git/tutorials/using-branches/merge-strategy



