#!/bin/bash
set -euo pipefail

input=$(cat)
cwd=$(echo "$input" | jq -r '.cwd // empty')

if [ -z "$cwd" ]; then
  cwd="$CLAUDE_PROJECT_DIR"
fi

output_file="$cwd/HANDOVER.md"
timestamp=$(date '+%Y-%m-%d %H:%M')

cat > "$output_file" <<EOF
# Handover - $timestamp

> PreCompact hook により自動生成。次のセッション開始時に確認すること。
> 詳細な引き継ぎノートが必要な場合は /handover コマンドで生成。

## Git Status

$(cd "$cwd" && git status --short 2>/dev/null || echo "(git status 取得失敗)")

## Recent Commits

$(cd "$cwd" && git log --oneline -5 2>/dev/null || echo "(git log 取得失敗)")

## Modified Files

$(cd "$cwd" && git diff --name-only 2>/dev/null || echo "(git diff 取得失敗)")
EOF

exit 0
