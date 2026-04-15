export interface KnowledgePageData {
  id: string;
  title: string;
  hashtags: string[];
  updatedAt: string;
  linked: number;
  linesCount: number;
  views: number;
  // Phase 3 (将来): embedding2d?: { x: number; y: number };
}

export interface KnowledgeProxyResponse {
  pages: KnowledgePageData[];
  count: number;
  projectName: string;
}

export interface TagSummary {
  name: string;
  count: number;
  /** タグに属するページの被リンク数合計 */
  totalLinked: number;
  /** タグに属するページの行数合計 */
  totalLines: number;
}
