import type { ScrapboxApiResponse, ScrapboxApiPage } from "./types";
import { extractHashtags } from "./hashtag-parser";

const UPSTREAM_BASE = "https://scrapbox.io/api/pages";
const BATCH_SIZE = 100;
const MAX_CONCURRENCY = 3;
const FETCH_TIMEOUT_MS = 10_000;

export interface KnowledgePageData {
  id: string;
  title: string;
  hashtags: string[];
  updatedAt: string;
  linked: number;
  linesCount: number;
  views: number;
}

export type KnowledgeResult =
  | {
      ok: true;
      pages: KnowledgePageData[];
      count: number;
      projectName: string;
    }
  | {
      ok: false;
      code: "network_error" | "upstream_error";
      message: string;
      status?: number;
    };

function transformPage(page: ScrapboxApiPage): KnowledgePageData {
  return {
    id: page.id,
    title: page.title,
    hashtags: extractHashtags(page.descriptions),
    updatedAt: new Date(page.updated * 1000).toISOString(),
    linked: page.linked,
    linesCount: page.linesCount,
    views: page.views,
  };
}

type FetchBatchError = {
  ok: false;
  code: "network_error" | "upstream_error";
  message: string;
  status?: number;
};

function isFetchBatchError(value: unknown): value is FetchBatchError {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    (value as { ok: unknown }).ok === false &&
    "code" in value
  );
}

async function fetchBatch(
  project: string,
  skip: number,
  scrapboxSid: string,
): Promise<{ ok: true; data: ScrapboxApiResponse } | FetchBatchError> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${UPSTREAM_BASE}/${project}?limit=${BATCH_SIZE}&skip=${skip}`, {
      headers: { Cookie: `connect.sid=${scrapboxSid}` },
      signal: controller.signal,
    });
  } catch (error) {
    return { ok: false, code: "network_error", message: String(error) };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    return {
      ok: false,
      code: "upstream_error",
      message: "Upstream error",
      status: response.status,
    };
  }

  let data: ScrapboxApiResponse;
  try {
    data = await response.json();
  } catch {
    return {
      ok: false,
      code: "upstream_error",
      message: "Invalid response body",
      status: response.status,
    };
  }

  return { ok: true, data };
}

export async function fetchWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing = new Set<Promise<void>>();
  for (const task of tasks) {
    const p = task().then((r) => {
      results.push(r);
    });
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}

export async function fetchAllKnowledgePages(
  project: string,
  scrapboxSid: string,
): Promise<KnowledgeResult> {
  // 1. Fetch the first batch to get total count
  const first = await fetchBatch(project, 0, scrapboxSid);
  if (!first.ok) {
    return first;
  }

  const { count, projectName } = first.data;
  const allPages: ScrapboxApiPage[] = [...first.data.pages];

  // 2. Fetch remaining batches with concurrency limit
  const remainingBatches: (() => Promise<ScrapboxApiPage[]>)[] = [];
  for (let skip = BATCH_SIZE; skip < count; skip += BATCH_SIZE) {
    const currentSkip = skip;
    remainingBatches.push(async () => {
      const result = await fetchBatch(project, currentSkip, scrapboxSid);
      if (!result.ok) {
        // FetchBatchError をそのまま投げて outer catch で code / status を保持する
        throw result;
      }
      return result.data.pages;
    });
  }

  if (remainingBatches.length > 0) {
    let batchResults: ScrapboxApiPage[][];
    try {
      batchResults = await fetchWithConcurrencyLimit(remainingBatches, MAX_CONCURRENCY);
    } catch (error) {
      if (isFetchBatchError(error)) {
        return {
          ok: false,
          code: error.code,
          message: error.message,
          ...(error.status !== undefined ? { status: error.status } : {}),
        };
      }
      return { ok: false, code: "network_error", message: String(error) };
    }
    for (const pages of batchResults) {
      allPages.push(...pages);
    }
  }

  // 3. Transform pages (extract hashtags, omit descriptions)
  const pages = allPages.map(transformPage);

  return { ok: true, pages, count, projectName };
}
