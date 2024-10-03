+++
title = 'GitHub ActionsでHugoの自動ビルド・デプロイを自動化するテスト'
date = 2024-10-02T07:22:57+09:00
draft = false
+++

hugoの自動ビルド・デプロイを自動化したいと思い設定しています。

この記事は、動作確認のテスト用に作成しました。

## 手順

今回実施した手順を記載します。
Hugoのデプロイ用のactionが公開されているので、それを利用します。
はじめは公開されているものがあると知らず、自分で設定しようとしていましたが、GitHub Actionsの公式リポジトリにHugoのデプロイ用のactionがあることを知りました。
GitHub Actionsの学習をする際には、自分で１から作成するのも良さそうですが、今回は公開されているものを利用します。

まずGitHub Actionsの設定ファイルを作成します。

```yaml

```

注意点として、workflowファイルのディクレクトリは`.github/workflows`である必要があります。  
`.github/workflow/hugo_build_deploy.yml`というファイル名で作成していたため、動作しませんでした。
