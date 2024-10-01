+++
title = 'GitHub ActionsでHugoの自動ビルド・デプロイを自動化するテスト'
date = 2024-10-02T07:22:57+09:00
draft = false
+++

hugoの自動ビルド・デプロイを自動化したいと思い設定しています。

この記事は、動作確認のテスト用に作成しました。

## 手順

今回実施した手順を記載します。
はじめに、GitHub Actionsの設定ファイルを作成します。

```yaml

```

注意点として、workflowファイルのディクレクトリは`.github/workflows`である必要があります。  
`.github/workflow/hugo_build_deploy.yml`というファイル名で作成していたため、動作しませんでした。
