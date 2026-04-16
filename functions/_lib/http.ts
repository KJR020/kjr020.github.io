/**
 * HTTP レスポンス共通ヘルパー。
 *
 * Pages Function のエンドポイント間で CORS / Cache-Control の付与ポリシーを共有するための
 * 最小限のユーティリティ。個別エンドポイントでのポリシーずれ (例: CORS 未設定 / キャッシュ暴露)
 * を防ぐために一本化している。
 */

/** 本番ドメインとして許可する Origin のホワイトリスト */
export const ALLOWED_ORIGINS: readonly string[] = [
  "https://kjr020.dev", // 本番カスタムドメイン
  "https://kjr020.pages.dev", // Cloudflare Pages プレビュー URL
];

/**
 * リクエストの Origin ヘッダが許可リストに含まれるかを判定する。
 *
 * - 大文字小文字違いや末尾スラッシュ違いは厳密一致しないので拒否する (例: `https://kjr020.dev/`)
 * - `Origin: null` や `Origin: file://` のようなブラウザ特殊値も一致しないため拒否される
 * - 開発用途のため `http://localhost:*` のみ例外的に許可する
 *
 * @returns 許可された Origin 文字列 / 許可されなければ null
 */
export function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  if (ALLOWED_ORIGINS.includes(origin)) return origin;

  // 開発時の localhost は任意ポートを許可
  if (origin.startsWith("http://localhost:")) return origin;

  return null;
}

/**
 * JSON レスポンスを CORS / Cache-Control ヘッダ付きで生成する。
 *
 * - エラー (status >= 400) は `Cache-Control: no-store` で CDN に載せない
 * - 成功時は `public, max-age=300` で 5 分キャッシュ可
 * - 許可外 Origin に対しては `Access-Control-Allow-Origin` を付与しない (フェイルクローズ)
 */
export function jsonResponse(body: unknown, status: number, request: Request): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // エラーレスポンスをキャッシュすると回復後も影響するため、成功時のみキャッシュを許可
    "Cache-Control": status >= 400 ? "no-store" : "public, max-age=300",
  };

  const allowedOrigin = getAllowedOrigin(request);
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Vary"] = "Origin";
  }

  return new Response(JSON.stringify(body), { status, headers });
}
