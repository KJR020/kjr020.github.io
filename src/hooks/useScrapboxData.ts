import { useQuery } from "@tanstack/react-query";
import type { ScrapboxDataFile, ScrapboxPageData } from "@/types/scrapbox";

async function fetchScrapboxJson(project: string): Promise<ScrapboxDataFile> {
  const response = await fetch(`/data/scrapbox-${project}.json`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("データが見つかりません");
    }
    throw new Error("データの取得に失敗しました");
  }

  const data: ScrapboxDataFile = await response.json();

  // 簡易バリデーション
  if (!data.projectName || !Array.isArray(data.pages)) {
    throw new Error("不正なデータ形式です");
  }

  return data;
}

interface UseScrapboxDataOptions {
  limit?: number;
}

export function useScrapboxData(project: string, options?: UseScrapboxDataOptions) {
  return useQuery({
    queryKey: ["scrapbox", project],
    queryFn: () => fetchScrapboxJson(project),
    select: (data: ScrapboxDataFile): ScrapboxPageData[] =>
      options?.limit ? data.pages.slice(0, options.limit) : data.pages,
    enabled: !!project,
  });
}
