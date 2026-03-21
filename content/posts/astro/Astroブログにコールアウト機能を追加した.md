+++
title = 'Astroブログにコールアウト機能を追加した'
date = '2026-01-21T22:08:00+09:00'
draft = false
tags = ['Astro']
+++

## 背景

下記の記事を読んで、Astroでmarkdown内部で拡張記法でコールアウトを使用できるようになる`remark-callout`というプラグインの存在を知りました。

このブログに実際に導入してみたので記事にまとめてみます。

<https://voltaney.com/posts/astro-plugins-preferences/>


> [!info] コールアウトとは
> コールアウト（callout）は、文章中で特に注意を引きたい情報を強調するための視覚的な要素です。\
> このようなブロックで表示される要素のことを指します。

## Remarkとは

そもそもRemarkとは何か、簡単に説明します。

公式リポジトリでは、

> markdown processor powered by plugins part of the @unifiedjs collective

とあり、Markdownを処理するためのプラグインベースのライブラリです。
Markdownを抽象構文木(AST)に変換し、プラグインを使って構文検査・変換・装飾などができるもののようです。

Astroではmarkdownの処理にRemarkを使用しており、Remarkプラグインを追加することでMarkdownの機能拡張が可能です。

<https://github.com/remarkjs/remark>
 
## remark-calloutとは

<https://github.com/r4ai/remark-callout>

Obsidianスタイルのコールアウト記法（`> [!note]`）をサポートするremarkプラグインです。

下記のような特徴があります。

- Obsidian形式の記法をサポート
- data属性ベースのHTML出力でCSSカスタマイズが容易
- MDXへの変換不要（.mdファイルのまま使える）


## 実装内容

実際に導入してみた手順を紹介します。

### 1. プラグインのインストールと設定

プラグインのインストールはnpm/pnpm/bunで可能です。
pnpmを使用していたので下記のコマンドでインストールしました。

```bash
pnpm add @r4ai/remark-callout
```

Astroのコンフィグファイル`astro.config.mjs`でremarkPluginsに追加します。
remarkPluginsの配列にremarkCalloutを追加し、必要に応じてアイコンをカスタマイズします。


```javascript
import remarkCallout from "@r4ai/remark-callout";

const calloutIcons = {
  note: '<svg>...</svg>',
  tip: '<svg>...</svg>',
  warning: '<svg>...</svg>',
  danger: '<svg>...</svg>',
};

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [
        remarkCallout,
        {
          icon: (callout) => calloutIcons[callout.type] || calloutIcons.note,
        },
      ],
    ],
  },
});
```

### 2. CSSスタイリング

デフォルトではスタイルが付与されないため、用途に応じてCSSで装飾が必要です。
今回は、Claudeとv0を活用しながら、シンプルなコールアウトを作成しました。
以下が実際に適用しているCSSです。

```css
/* Base Callout Styles */
[data-callout] {
  margin: 1.5em 0;
  padding: 1rem 1.25rem;
  border-left: 2px solid var(--border);
}

[data-callout-title] {
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

[data-callout-body] {
  color: var(--muted-foreground);
  font-size: 0.875rem;
}

[data-callout-body] > *:last-child {
  margin-bottom: 0;
}

/* Type-specific Styles（note, tip, warning, dangerの4種類を定義） */
[data-callout-type="note"] {
  border-left-color: hsl(199 89% 48% / 0.6);
}

[data-callout-type="note"] [data-callout-title] {
  color: hsl(199 89% 48% / 0.9);
}

[data-callout-type="warning"] {
  border-left-color: hsl(38 92% 50% / 0.6);
}

[data-callout-type="warning"] [data-callout-title] {
  color: hsl(38 92% 50% / 0.9);
}

/* tip, danger も同様に定義 */
```

背景色は使わず、左ボーダーと透明度で控えめに表現しています。

## 使い方

Markdown内で以下のように記述するとコールアウトが利用できます。

```markdown
> [!note]
> これは補足情報です。

> [!warning]
> これは注意事項です。
```

> [!note]
> これは補足情報です。

> [!warning]
> これは注意事項です。

## 参考

<https://github.com/r4ai/remark-callout>

<https://r4ai.github.io/remark-callout/>

<https://vivliostyle.github.io/vivliostyle_doc/ja/vivliostyle-user-group-vol2/spring-raining/index.html>

<https://zenn.dev/chot/articles/7885c407aab52d>