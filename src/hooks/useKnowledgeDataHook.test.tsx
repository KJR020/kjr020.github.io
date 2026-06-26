import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { KnowledgePageData, KnowledgeProxyResponse } from "@/types/knowledge";
import { useKnowledgeData } from "./useKnowledgeData";

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function page(id: string, hashtags: string[]): KnowledgePageData {
  return {
    id,
    title: id,
    hashtags,
    updatedAt: "2026-05-05T00:00:00Z",
    linked: 1,
    linesCount: 10,
    views: 0,
  };
}

function response(pages: KnowledgePageData[]): KnowledgeProxyResponse {
  return {
    pages,
    count: pages.length,
    projectName: "project",
  };
}

describe("useKnowledgeData", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("project名をエンコードしてknowledge proxyからページとタグ集計を返す", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(response([page("one", ["A"]), page("two", ["A", "B"])])), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { result } = renderHook(() => useKnowledgeData("project name"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.totalPages).toBe(2));

    expect(fetch).toHaveBeenCalledWith("/api/knowledge/project%20name");
    expect(result.current.pages.map((item) => item.id)).toEqual(["one", "two"]);
    expect(result.current.tags.map((tag) => tag.name)).toEqual(["A", "B"]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("proxyが失敗したらerrorを返す", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("error", { status: 503 }));

    const { result } = renderHook(() => useKnowledgeData("project"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toEqual(new Error("API error: 503")));

    expect(result.current.pages).toEqual([]);
    expect(result.current.tags).toEqual([]);
    expect(result.current.totalPages).toBe(0);
  });

  it("projectが空ならfetchせず空の結果を返す", () => {
    const { result } = renderHook(() => useKnowledgeData(""), {
      wrapper: createWrapper(),
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.pages).toEqual([]);
    expect(result.current.tags).toEqual([]);
    expect(result.current.totalPages).toBe(0);
  });
});
