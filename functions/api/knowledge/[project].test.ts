/** @vitest-environment node */
import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequestGet } from "./[project]";

afterEach(() => vi.unstubAllGlobals());

function mockSuccessfulScrapboxFetch() {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        projectName: "KJR020",
        skip: 0,
        limit: 100,
        count: 1,
        pages: [
          {
            id: "p1",
            title: "page-1",
            image: null,
            descriptions: ["#設計 memo"],
            updated: 1_700_000_000,
            created: 1_700_000_000,
            views: 10,
            linked: 2,
            linesCount: 20,
            pin: 0,
          },
        ],
      }),
      { status: 200 },
    ),
  );
}

function createContext(
  project: string,
  options?: { origin?: string; scrapboxSid?: string },
) {
  const headers = new Headers();
  if (options?.origin) headers.set("Origin", options.origin);
  return {
    params: { project },
    env: { SCRAPBOX_SID: options?.scrapboxSid ?? "test-sid" },
    request: new Request(`https://kjr020.pages.dev/api/knowledge/${project}`, { headers }),
  // biome-ignore lint/suspicious/noExplicitAny: minimum PagesFunction context for testing
  } as any;
}

describe("GET /api/knowledge/:project", () => {
  it("不正なプロジェクト名 (path traversal) を 400 で拒否する", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const ctx = createContext("../../users");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "Invalid project name" });
  });

  it("SCRAPBOX_SID 未設定時は 500 を返す", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const ctx = createContext("KJR020", { scrapboxSid: "" });
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(500);
  });

  it("エラーレスポンスは Cache-Control: no-store", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const ctx = createContext("../../users");
    const res = await onRequestGet(ctx);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("成功レスポンスは Cache-Control: public, max-age=300", async () => {
    vi.stubGlobal("fetch", mockSuccessfulScrapboxFetch());
    const ctx = createContext("KJR020");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=300");
  });

  it("成功レスポンスには pages/count/projectName が含まれる", async () => {
    vi.stubGlobal("fetch", mockSuccessfulScrapboxFetch());
    const ctx = createContext("KJR020");
    const res = await onRequestGet(ctx);
    const body = await res.json();
    expect(body.projectName).toBe("KJR020");
    expect(body.count).toBe(1);
    expect(Array.isArray(body.pages)).toBe(true);
  });

  it("本番ドメイン Origin は CORS で許可される", async () => {
    vi.stubGlobal("fetch", mockSuccessfulScrapboxFetch());
    const ctx = createContext("KJR020", { origin: "https://kjr020.github.io" });
    const res = await onRequestGet(ctx);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://kjr020.github.io");
  });

  it("許可外ドメイン Origin は Access-Control-Allow-Origin を付与しない", async () => {
    vi.stubGlobal("fetch", mockSuccessfulScrapboxFetch());
    const ctx = createContext("KJR020", { origin: "https://evil.example.com" });
    const res = await onRequestGet(ctx);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("localhost Origin は開発用途で許可される", async () => {
    vi.stubGlobal("fetch", mockSuccessfulScrapboxFetch());
    const ctx = createContext("KJR020", { origin: "http://localhost:4321" });
    const res = await onRequestGet(ctx);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:4321");
  });

  it("レスポンスには SCRAPBOX_SID の値が含まれない", async () => {
    const secret = "s:super-secret-sid.signature";
    vi.stubGlobal("fetch", mockSuccessfulScrapboxFetch());
    const ctx = createContext("KJR020", { scrapboxSid: secret });
    const res = await onRequestGet(ctx);
    const body = await res.text();
    expect(body).not.toContain(secret);
  });
});
