/** @vitest-environment node */
import { describe, expect, it, vi, afterEach } from "vitest";
import { validateProject, fetchPages } from "./cms-proxy";

afterEach(() => vi.unstubAllGlobals());

const MOCK_API_RESPONSE = Object.freeze({
  projectName: "KJR020",
  skip: 0,
  limit: 100,
  count: 1,
  pages: [
    {
      id: "page1",
      title: "テストページ",
      image: "https://example.com/img.png",
      descriptions: ["1行目", "2行目", "3行目", "4行目"],
      pin: 0,
      views: 10,
      linked: 5,
      updated: 1700000000,
      accessed: 1700000000,
      created: 1700000000,
    },
  ],
});

function mockApiResponse(overrides?: {
  pages?: Partial<(typeof MOCK_API_RESPONSE.pages)[0]>[];
}) {
  const data = {
    ...MOCK_API_RESPONSE,
    pages: overrides?.pages
      ? overrides.pages.map((p) => ({ ...MOCK_API_RESPONSE.pages[0], ...p }))
      : MOCK_API_RESPONSE.pages,
  };
  return new Response(JSON.stringify(data), { status: 200 });
}

describe("validateProject", () => {
  it("英数字プロジェクト名を許可する", () => {
    expect(validateProject("KJR020")).toBe(true);
  });
  it("ハイフンを許可する", () => {
    expect(validateProject("my-project")).toBe(true);
  });
  it("アンダースコアを許可する", () => {
    expect(validateProject("my_project")).toBe(true);
  });
  it("パストラバーサルを拒否する", () => {
    expect(validateProject("../../users")).toBe(false);
  });
  it("スラッシュを拒否する", () => {
    expect(validateProject("foo/bar")).toBe(false);
  });
  it("空文字を拒否する", () => {
    expect(validateProject("")).toBe(false);
  });
});

describe("fetchPages", () => {
  it("正常レスポンスを PageData[] に変換する", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockApiResponse()));
    const result = await fetchPages("KJR020", "", "sid");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].description).toBe("1行目 2行目 3行目");
    expect(result.pages[0].imageUrl).toBe("https://example.com/img.png");
    expect(result.pages[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.pages[0].url).toContain(encodeURIComponent("テストページ"));
  });

  it("image が null のページを変換する", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockApiResponse({ pages: [{ image: null }] })));
    const result = await fetchPages("KJR020", "", "sid");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pages[0].imageUrl).toBeNull();
  });

  it("Upstream URL が scrapbox.io/api/pages/ で始まる", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockApiResponse());
    vi.stubGlobal("fetch", mockFetch);
    await fetchPages("KJR020", "", "sid");
    expect(mockFetch.mock.calls[0][0]).toMatch(/^https:\/\/scrapbox\.io\/api\/pages\//);
  });

  it("Cookie ヘッダーに connect.sid を設定する", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockApiResponse());
    vi.stubGlobal("fetch", mockFetch);
    await fetchPages("KJR020", "", "s:test.sig");
    expect(mockFetch.mock.calls[0][1].headers.Cookie).toBe("connect.sid=s:test.sig");
  });

  it("クエリパラメータを Upstream URL に透過する", async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockApiResponse());
    vi.stubGlobal("fetch", mockFetch);
    await fetchPages("KJR020", "?limit=5", "sid");
    expect(mockFetch.mock.calls[0][0]).toContain("?limit=5");
  });

  it("Upstream 401 で upstream_error を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Unauthorized", { status: 401 })));
    const result = await fetchPages("KJR020", "", "sid");
    expect(result).toEqual({ ok: false, code: "upstream_error", message: "Upstream error", status: 401 });
  });

  it("Upstream 404 で upstream_error を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 })));
    const result = await fetchPages("KJR020", "", "sid");
    expect(result).toEqual({ ok: false, code: "upstream_error", message: "Upstream error", status: 404 });
  });

  it("Upstream が不正 JSON を返した場合 upstream_error を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>Error</html>", { status: 200 })));
    const result = await fetchPages("KJR020", "", "sid");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("upstream_error");
    expect(result.message).toBe("Invalid response body");
  });

  it("ネットワークエラーで network_error を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("DNS failed")));
    const result = await fetchPages("KJR020", "", "sid");
    expect(result).toEqual({ ok: false, code: "network_error", message: "Error: DNS failed" });
  });

  it("戻り値に Secret（connect.sid の値）が含まれない", async () => {
    const secret = "s:secret-session-id.signature";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockApiResponse()));
    const result = await fetchPages("KJR020", "", secret);
    expect(JSON.stringify(result)).not.toContain(secret);
  });
});
