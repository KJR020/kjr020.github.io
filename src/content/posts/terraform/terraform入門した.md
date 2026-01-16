---
title: "Terraform入門してみる"
date: "2025-04-19T05:52:35+09:00"
draft: false
---

## 経緯

今回はTerraformに入門する記事です。

目的としては、Terraformの概要を掴むことです。
動機としては、「近々業務でTerraformを使うことになったため、概要を掴みたい」というものです。
アプリケーションの環境を構築するわけではなく、負荷試験のリクエストを送るための環境を構築する
そのため、基本的な文法を抑えること/動作を確認することで雰囲気を掴むことを目指しています。

まずTerraformとは何か？について調べます。

### Terraformとは？

TerraformはHashiCorp社のIaC(Infrastructure as Code)のツールです。
マルチクラウドに対応しAWS, Azure, GCPなど、1,000以上のプロバイダーに対応しています。

Terraformの主な利点：
- コードとしてインフラを管理（バージョン管理可能）
- 宣言的な記述方式（何をしたいかを記述）
- マルチクラウド対応
- 再利用可能なモジュール
- 状態管理による整合性の確保

Terraformをdockerで動かして、nginxを起動するチュートリアルを試してみます。

<https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli>


## インストール

brewでインストール可能です。
注意点としては、リポジトリに`hashicorp/terraform`を追加する必要があります

```bash
brew tap hashicorp/terraform
brew install terraform
```

`terraform -help`で動作確認したら、インストール完了です。

## tfファイルの作成

次に`main.tf`ファイルを作成します。

```text
terraform-nginx/
├── main.tf
```

`main.tf`の内容は以下のような内容です。(公式チュートリアルそのまま)

```terraform
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

resource "docker_image" "nginx" {
  name         = "nginx"
  keep_locally = false
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "tutorial"

  ports {
    internal = 80
    external = 8000
  }
}
```

tfファイルには、
terraform, provider, resourceの3つのセクションがあります。

### 各セクションの説明

#### terraform セクション
このセクションでは、Terraformの設定を指定します。ここでは、使用するプロバイダーとそのバージョンを定義しています。`required_providers`ブロックでは、使用するプロバイダーの情報を記述します。

#### provider セクション
プロバイダーとは、特定のインフラストラクチャ（AWS、GCP、Azureなど）やサービスとTerraformを連携させるためのプラグインです。ここではDockerプロバイダーを使用しています。空のブロックは、デフォルト設定で使用することを意味します。

#### resource セクション
リソースは、管理するインフラストラクチャの要素を定義します。ここでは2つのリソースを定義しています：
1. `docker_image` - Nginxのイメージを取得
2. `docker_container` - そのイメージを使用してコンテナを作成し、ポートマッピングを設定

## Terraformの初期化と実行

### 初期化
作成したディレクトリで以下のコマンドを実行し、Terraformを初期化します：

```bash
terraform init
```

初期化すると、`.terraform`ディレクトリが作成され、必要なプロバイダープラグインがダウンロードされます。

### 適用

実際に適用します：

```bash
terraform apply
```

確認を求められるので「yes」と入力します。



```text
Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # docker_container.nginx will be created
  + resource "docker_container" "nginx" {
      + attach                                      = false
      + bridge                                      = (known after apply)
      + command                                     = (known after apply)
      + container_logs                              = (known after apply)
      + container_read_refresh_timeout_milliseconds = 15000
      + entrypoint                                  = (known after apply)
      + env                                         = (known after apply)
      + exit_code                                   = (known after apply)
      + hostname                                    = (known after apply)
      + id                                          = (known after apply)
      + image                                       = (known after apply)
      + init                                        = (known after apply)
      + ipc_mode                                    = (known after apply)
      + log_driver                                  = (known after apply)
      + logs                                        = false
      + must_run                                    = true
      + name                                        = "tutorial"
      + network_data                                = (known after apply)
      + read_only                                   = false
      + remove_volumes                              = true
      + restart                                     = "no"
      + rm                                          = false
      + runtime                                     = (known after apply)
      + security_opts                               = (known after apply)
      + shm_size                                    = (known after apply)
      + start                                       = true
      + stdin_open                                  = false
      + stop_signal                                 = (known after apply)
      + stop_timeout                                = (known after apply)
      + tty                                         = false
      + wait                                        = false
      + wait_timeout                                = 60

      + healthcheck (known after apply)

      + labels (known after apply)

      + ports {
          + external = 8000
          + internal = 80
          + ip       = "0.0.0.0"
          + protocol = "tcp"
        }
    }

  # docker_image.nginx will be created
  + resource "docker_image" "nginx" {
      + id           = (known after apply)
      + image_id     = (known after apply)
      + keep_locally = false
      + name         = "nginx:1.14.2"
      + repo_digest  = (known after apply)
    }

Plan: 2 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

```


## リソースの破棄

リソースの破棄は`terraform destroy`コマンドで行います。

```bash
terraform destroy
```

これにより、Terraformが管理しているすべてのリソースが削除されます。


## まとめ

今回はTerraformの基本的な使い方を学びました。
概念や記載方法としては、シンプルで学習コストは低いなと感じました。
