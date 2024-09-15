#!/bin/bash

# ベースディレクトリの設定
SOURCE_DIR=~/work/kjr020.github.io/LearningNotes
HUGO_POSTS_DIR=~/work/kjr020-blog  # Hugoのpostsディレクトリに変更してください

# Hugoの作業ディレクトリに移動
cd "$HUGO_POSTS_DIR"

# LearningNotes配下のすべてのMarkdownファイルを処理
find "$SOURCE_DIR" -name "*.md" | while read -r file; do
  # ファイル名だけを抽出（拡張子あり）
  filename=$(basename "$file")
  
  # hugo new posts/<ファイル名>で新しいファイルを作成
  hugo new "posts/$filename"

  # 元ファイルの作成日時を取得（macOSのstatコマンドを使用し、UTCオフセット込みのISO 8601形式に変換）
  file_date=$(stat -f "%SB" -t "%Y-%m-%d %H:%M:%S" "$file")
  
  # タイムゾーン情報を付与してISO 8601形式に変換
  iso_date=$(date -j -f "%Y-%m-%d %H:%M:%S" "$file_date" +"%Y-%m-%dT%H:%M:%S%z" | sed 's/\([0-9]\{2\}\)\([0-9]\{2\}\)$/\1:\2/')

  # 新しいHugoのMarkdownファイルパス
  hugo_file="$HUGO_POSTS_DIR/content/posts/$filename"

  # 元ファイルからメタ情報（---で囲まれた部分）を削除し、残りのコンテンツを取得
  content=$(sed '/^---$/,/^---$/d' "$file")

  # Hugoで生成されたファイルのメタ情報を変更
  # titleをファイル名、dateを元ファイルの作成日時に変更
  sed -i '' "s/^title = .*/title = '$(basename "$filename" .md)'/" "$hugo_file"
  sed -i '' "s/^date = .*/date = '$iso_date'/" "$hugo_file"

  # 元ファイルのコンテンツを新しいHugoファイルに追記
  echo "$content" >> "$hugo_file"

  echo "Processed $file -> $hugo_file"
done