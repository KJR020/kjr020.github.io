---
layout: default
title: GitHub Pages のマークダウンに自動更新日時を入れたい
update: 2024-03-02 09:51:23
date: 2024-03-02 09:51:23
---

# {{ page.title }}
最終更新: {{ page.date }} 


## 経緯

GitHub Pagesで学習ノートを公開していた。  
「ページに更新日時があるといいな」と思ったが、
毎回書き込むのは手間がかかるため、自動で更新日時を付与できないか？と考えた。
調べて実装してみた。  

## 実装

以下の例のように、YAMLヘッダー(---で囲まれたセクション)にメタデータを記載します。
このメタデータは、ページ内で `{{ page.update }}` のように記述すると、
GitHub Pages 上で自動的に更新日時が挿入されて表示されるようになる。

　GitHub Pagesには、Jekyllという静的サイトジェネレータが組み込まれており、



```markdown

---
layout: default
title: GitHub Pages のマークダウンに自動更新日時を入れたい
update: 2024-03-02 09:51:23
---

# {{ page.title }}
最終更新日: {{ page.update }}

## 経緯

GitHub Pagesで学習ノートを公開していた。  
「ページに更新日時があるといいな」と思ったが、
毎回書き込むのは手間がかかるため、自動で更新日時を付与できないか？と考えた。
調べて実装してみた。  

```


## 参考

- https://pandanote.info/?p=6871
- https://docs.github.com/ja/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll
- https://docs.github.com/ja/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll