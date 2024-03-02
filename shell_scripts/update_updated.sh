DATE=`date +%Y-%m-%d %H:%M:%S`
find . -name '*.md' -exec sed -i "s/updated: .*/updated: $DATE/" {} \;