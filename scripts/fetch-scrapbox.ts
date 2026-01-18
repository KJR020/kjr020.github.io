import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
  ScrapboxApiResponse,
  ScrapboxApiPage,
  ScrapboxPageData,
  ScrapboxDataFile,
} from "../src/types/scrapbox";

const SCRAPBOX_API_BASE = "https://scrapbox.io/api/pages";

/**
 * descriptions 配列を空白区切りで結合
 */
export function transformDescriptions(descriptions: string[]): string {
  return descriptions.slice(0, 3).join(" ");
}

/**
 * Unix タイムスタンプを ISO 8601 形式に変換
 */
export function transformTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Scrapbox ページ URL を生成
 */
export function generatePageUrl(project: string, title: string): string {
  return `https://scrapbox.io/${project}/${encodeURIComponent(title)}`;
}

/**
 * API レスポンスをクライアント用データに変換
 */
function transformPage(
  page: ScrapboxApiPage,
  projectName: string
): ScrapboxPageData {
  return {
    id: page.id,
    title: page.title,
    imageUrl: page.image,
    description: transformDescriptions(page.descriptions),
    updatedAt: transformTimestamp(page.updated),
    url: generatePageUrl(projectName, page.title),
  };
}

/**
 * Scrapbox API からページ一覧を取得
 */
export async function fetchScrapboxPages(
  projectName: string,
  options?: { limit?: number }
): Promise<ScrapboxDataFile> {
  const limit = options?.limit ?? 100;
  const url = `${SCRAPBOX_API_BASE}/${projectName}?limit=${limit}`;

  console.log(`Fetching Scrapbox pages from: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Scrapbox API: ${response.status} ${response.statusText}`
    );
  }

  const data: ScrapboxApiResponse = await response.json();

  // バリデーション
  if (!data.projectName || !Array.isArray(data.pages)) {
    throw new Error("Invalid API response format");
  }

  const pages = data.pages.map((page) => transformPage(page, data.projectName));

  return {
    projectName: data.projectName,
    fetchedAt: new Date().toISOString(),
    pages,
  };
}

/**
 * JSON ファイルに保存
 */
async function saveToFile(
  data: ScrapboxDataFile,
  outputPath: string
): Promise<void> {
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved to: ${outputPath}`);
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  const projectName = process.env.SCRAPBOX_PROJECT;

  if (!projectName) {
    console.log("SCRAPBOX_PROJECT environment variable is not set. Skipping.");
    return;
  }

  const outputPath = path.resolve(
    process.cwd(),
    `public/data/scrapbox-${projectName}.json`
  );

  try {
    const data = await fetchScrapboxPages(projectName);
    await saveToFile(data, outputPath);
    console.log(`Successfully fetched ${data.pages.length} pages.`);
  } catch (error) {
    console.error("Error fetching Scrapbox data:", error);
    // 既存ファイルを保持してビルドは継続
    const existingFile = await fs
      .access(outputPath)
      .then(() => true)
      .catch(() => false);
    if (existingFile) {
      console.log("Keeping existing JSON file.");
    }
    // ビルドを失敗させないため、エラーはスローしない
  }
}

main();
