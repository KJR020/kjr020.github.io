/**
 * Scrapbox API レスポンス型
 */
export interface ScrapboxApiResponse {
  projectName: string;
  skip: number;
  limit: number;
  count: number;
  pages: ScrapboxApiPage[];
}

export interface ScrapboxApiPage {
  id: string;
  title: string;
  image: string | null;
  descriptions: string[];
  updated: number;
  created: number;
  views: number;
  linked: number;
  pin: number;
}

/**
 * クライアント用の正規化されたページデータ型
 */
export interface ScrapboxPageData {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string;
  updatedAt: string;
  url: string;
}

/**
 * 静的 JSON ファイルの型
 */
export interface ScrapboxDataFile {
  projectName: string;
  fetchedAt: string;
  pages: ScrapboxPageData[];
}
