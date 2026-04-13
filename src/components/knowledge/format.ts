/** Scrapbox ページの URL を組み立てる */
export function scrapboxUrl(project: string, title: string): string {
  return `https://scrapbox.io/${project}/${encodeURIComponent(title)}`;
}

/**
 * ISO 8601 形式の日付文字列を「今日/昨日/N日前」等の相対表記に変換する。
 * クロックスキューで日付が未来になっても負値を返さないようにクランプする。
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)),
  );
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}
