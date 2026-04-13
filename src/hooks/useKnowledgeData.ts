import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { KnowledgePageData, KnowledgeProxyResponse, TagSummary } from "@/types/knowledge";

async function fetchKnowledgePages(project: string): Promise<KnowledgeProxyResponse> {
  const response = await fetch(`/api/knowledge/${encodeURIComponent(project)}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

interface UseKnowledgeDataReturn {
  pages: KnowledgePageData[];
  tags: TagSummary[];
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

export function useKnowledgeData(project: string): UseKnowledgeDataReturn {
  const query = useQuery({
    queryKey: ["knowledge", project],
    queryFn: () => fetchKnowledgePages(project),
    enabled: !!project,
    staleTime: 5 * 60 * 1000,
  });

  const pages = query.data?.pages ?? [];
  const totalPages = query.data?.count ?? 0;

  const tags = useMemo(() => {
    const tagToPages = new Map<string, KnowledgePageData[]>();
    for (const page of pages) {
      for (const tag of page.hashtags) {
        const existing = tagToPages.get(tag);
        if (existing) {
          existing.push(page);
        } else {
          tagToPages.set(tag, [page]);
        }
      }
    }

    const summaries: TagSummary[] = [];
    for (const [name, tagPages] of tagToPages) {
      summaries.push({
        name,
        count: tagPages.length,
        totalLinked: tagPages.reduce((sum, p) => sum + p.linked, 0),
        totalLines: tagPages.reduce((sum, p) => sum + p.linesCount, 0),
      });
    }

    // ページ数降順、同数なら被リンク数でタイブレーク
    summaries.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.totalLinked - a.totalLinked;
    });
    return summaries;
  }, [pages]);

  return {
    pages,
    tags,
    totalPages,
    isLoading: query.isLoading,
    error: query.error,
  };
}
