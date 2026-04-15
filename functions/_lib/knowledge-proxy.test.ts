/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAllKnowledgePages, fetchWithConcurrencyLimit } from "./knowledge-proxy";

afterEach(() => vi.unstubAllGlobals());

interface MockPageOverrides {
  id?: string;
  title?: string;
  descriptions?: string[];
  updated?: number;
  linked?: number;
  linesCount?: number;
  views?: number;
}

function mockPage(i: number, overrides?: MockPageOverrides) {
  return {
    id: `p${i}`,
    title: `page-${i}`,
    image: null,
    descriptions: [`#設計 description for ${i}`],
    updated: 1_700_000_000 + i,
    created: 1_700_000_000,
    views: 10,
    linked: 2,
    linesCount: 20,
    pin: 0,
    ...overrides,
  };
}

/** skip に応じて分割レスポンスを返す fetch モック */
function mockScrapboxApi(totalCount: number, pageFactory: (i: number) => ReturnType<typeof mockPage>) {
  return vi.fn().mockImplementation((url: string) => {
    const skipMatch = url.match(/skip=(\d+)/);
    const limitMatch = url.match(/limit=(\d+)/);
    const skip = skipMatch ? Number(skipMatch[1]) : 0;
    const limit = limitMatch ? Number(limitMatch[1]) : 100;
    const pages = Array.from({ length: Math.min(limit, totalCount - skip) }, (_, i) =>
      pageFactory(skip + i),
    );
    return Promise.resolve(
      new Response(
        JSON.stringify({ projectName: "KJR020", skip, limit, count: totalCount, pages }),
        { status: 200 },
      ),
    );
  });
}

describe("fetchAllKnowledgePages", () => {
  it("1バッチ (count <= 100) を取得して変換する", async () => {
    vi.stubGlobal("fetch", mockScrapboxApi(3, mockPage));
    const result = await fetchAllKnowledgePages("KJR020", "sid");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.count).toBe(3);
    expect(result.pages).toHaveLength(3);
    expect(result.projectName).toBe("KJR020");
  });

  it("複数バッチ (count > 100) を全て取得する", async () => {
    vi.stubGlobal("fetch", mockScrapboxApi(250, mockPage));
    const result = await fetchAllKnowledgePages("KJR020", "sid");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pages).toHaveLength(250);
    // すべてのページが一意の id を持つ
    const ids = new Set(result.pages.map((p) => p.id));
    expect(ids.size).toBe(250);
  });

  it("descriptions 原文はレスポンスに含めない (K-3)", async () => {
    const secret = "秘密のメモ内容";
    vi.stubGlobal(
      "fetch",
      mockScrapboxApi(1, () => mockPage(0, { descriptions: [`#設計 ${secret}`] })),
    );
    const result = await fetchAllKnowledgePages("KJR020", "sid");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(JSON.stringify(result.pages)).not.toContain(secret);
    // hashtag だけ抽出されている
    expect(result.pages[0].hashtags).toEqual(["設計"]);
  });

  it("Cookie ヘッダーに connect.sid を設定する", async () => {
    const mockFetch = mockScrapboxApi(1, mockPage);
    vi.stubGlobal("fetch", mockFetch);
    await fetchAllKnowledgePages("KJR020", "s:session.sig");
    expect(mockFetch.mock.calls[0][1].headers.Cookie).toBe("connect.sid=s:session.sig");
  });

  it("戻り値に Secret (connect.sid 値) が含まれない", async () => {
    const secret = "s:secret-session-id.signature";
    vi.stubGlobal("fetch", mockScrapboxApi(1, mockPage));
    const result = await fetchAllKnowledgePages("KJR020", secret);
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("初回バッチが 401 のとき upstream_error + status を保持する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unauthorized", { status: 401 })),
    );
    const result = await fetchAllKnowledgePages("KJR020", "sid");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("upstream_error");
    expect(result.status).toBe(401);
  });

  it("残りバッチが 403 のとき upstream_error + status=403 を伝播する", async () => {
    // 最初のバッチは成功、2回目以降は 403
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                projectName: "KJR020",
                skip: 0,
                limit: 100,
                count: 150,
                pages: Array.from({ length: 100 }, (_, i) => mockPage(i)),
              }),
              { status: 200 },
            ),
          );
        }
        return Promise.resolve(new Response("Forbidden", { status: 403 }));
      }),
    );
    const result = await fetchAllKnowledgePages("KJR020", "sid");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("upstream_error");
    expect(result.status).toBe(403);
  });

  it("初回バッチで fetch が throw すると network_error を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("DNS failed")));
    const result = await fetchAllKnowledgePages("KJR020", "sid");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("network_error");
  });
});

describe("fetchWithConcurrencyLimit", () => {
  it("並列度を指定値以下に保つ", async () => {
    let inFlight = 0;
    let peakInFlight = 0;
    const tasks = Array.from({ length: 10 }, () => async () => {
      inFlight++;
      peakInFlight = Math.max(peakInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 10));
      inFlight--;
      return "ok";
    });
    await fetchWithConcurrencyLimit(tasks, 3);
    expect(peakInFlight).toBeLessThanOrEqual(3);
  });

  it("全タスクの結果を返す", async () => {
    const tasks = [1, 2, 3, 4, 5].map((n) => async () => n * 2);
    const results = await fetchWithConcurrencyLimit(tasks, 2);
    expect(results.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
  });
});
