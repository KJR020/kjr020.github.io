#!/bin/bash

# 現在の日付と時刻を取得
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 現在のディレクトリ内のすべての.mdファイルを対象に処理
FILES=$(find . -type f -name '*timestamp.md')

for FILE in $FILES; do
  echo "Processing $FILE..."
  
  # YAMLヘッダーの抽出
  awk '/^---$/{flag++} flag==1 {print} /^---$/{flag++}' $FILE > header.md
  
  # publishedが空なら更新
  if ! grep -q "^published: [^ ]" header.md; then
    sed -i "" "/^published:.*$/s//published: $DATE/" header.md
  fi

  # updatedは常に更新
  sed -i "" "/^updated:.*$/s//updated: $DATE/" header.md
  
  # 更新したヘッダーを元のファイルに統合
  sed '1,/---/!b;//{//!d;};r header.md' $FILE > updated_file.md && mv updated_file.md $FILE
  
  rm header.md  # 一時ファイルの削除
done
