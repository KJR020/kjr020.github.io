// `[...]` 内は URL fragment やページリンクなのでタグ対象外
const BRACKET_PATTERN = /\[[^\]]*\]/g;
// 空白または行頭に続く `#タグ名` のみを抽出 (URL fragment や単語途中の # を除外)
const HASHTAG_PATTERN = /(?:^|\s)#([\w\u3000-\u9FFF]+)/g;

/**
 * Scrapbox ハッシュタグはスペースが使えないため、慣例として `_` を
 * スペースの代替に使う (例: `#Claude_Code` = "Claude Code")。
 * 内部キー・表示名を一致させるためタグ抽出時に正規化する。
 */
function normalizeTag(raw: string): string {
  return raw.replace(/_/g, " ");
}

export function extractHashtags(descriptions: string[]): string[] {
  const text = descriptions.join("\n").replace(BRACKET_PATTERN, " ");
  const tags = new Set<string>();
  for (const match of text.matchAll(HASHTAG_PATTERN)) {
    tags.add(normalizeTag(match[1]));
  }
  return [...tags].sort();
}
