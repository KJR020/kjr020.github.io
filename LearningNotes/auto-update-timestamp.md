# GitHub Pages のマークダウンに自動更新日時を入れたい

Last updated: {{ page.last_modified_at | date: '%Y-%m-%d %H:%M:%S' }}

## 経緯

GitHub Pagesで学習ノートを公開していた。  
「ページに更新日時があるといいな～」と思ったため、自動で更新日時を付与できないか？  
調べて実装してみた。  

## 参考

- https://pandanote.info/?p=6871
