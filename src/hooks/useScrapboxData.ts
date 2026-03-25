import { useQuery } from "@tanstack/react-query";
import type { ScrapboxPageData } from "@/types/scrapbox";

async function fetchFromProxy(project: string): Promise<ScrapboxPageData[]> {
  const response = await fetch(`/api/pages/${encodeURIComponent(project)}?limit=100`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

interface UseScrapboxDataOptions {
  limit?: number;
}

export function useScrapboxData(project: string, options?: UseScrapboxDataOptions) {
  return useQuery({
    queryKey: ["scrapbox", project],
    queryFn: () => fetchFromProxy(project),
    select: (pages: ScrapboxPageData[]): ScrapboxPageData[] =>
      options?.limit !== undefined ? pages.slice(0, options.limit) : pages,
    enabled: !!project,
  });
}
