/** @vitest-environment node */
import { describe, expect, it } from "vitest";
import { getAllowedOrigin, jsonResponse } from "./http";

function reqWith(origin?: string | null): Request {
  const headers = new Headers();
  if (origin !== undefined && origin !== null) headers.set("Origin", origin);
  return new Request("https://kjr020.pages.dev/api/test", { headers });
}

describe("getAllowedOrigin", () => {
  it("本番ドメイン (github.io) をそのまま返す", () => {
    expect(getAllowedOrigin(reqWith("https://kjr020.github.io"))).toBe(
      "https://kjr020.github.io",
    );
  });

  it("本番ドメイン (pages.dev) をそのまま返す", () => {
    expect(getAllowedOrigin(reqWith("https://kjr020.pages.dev"))).toBe(
      "https://kjr020.pages.dev",
    );
  });

  it("localhost は任意ポートを許可する", () => {
    expect(getAllowedOrigin(reqWith("http://localhost:4321"))).toBe(
      "http://localhost:4321",
    );
    expect(getAllowedOrigin(reqWith("http://localhost:3000"))).toBe(
      "http://localhost:3000",
    );
  });

  it("Origin 欠落時は null", () => {
    expect(getAllowedOrigin(reqWith())).toBeNull();
  });

  it("Origin: null (文字列) は拒否する", () => {
    expect(getAllowedOrigin(reqWith("null"))).toBeNull();
  });

  it("file:// スキームは拒否する", () => {
    expect(getAllowedOrigin(reqWith("file://"))).toBeNull();
  });

  it("末尾スラッシュ付き許可ドメインは拒否する", () => {
    expect(getAllowedOrigin(reqWith("https://kjr020.github.io/"))).toBeNull();
  });

  it("サブドメイン偽装 (github.io.evil.com) は拒否する", () => {
    expect(
      getAllowedOrigin(reqWith("https://kjr020.github.io.evil.com")),
    ).toBeNull();
  });

  it("大文字違いは拒否する (厳密一致)", () => {
    expect(getAllowedOrigin(reqWith("https://KJR020.github.io"))).toBeNull();
  });

  it("http スキームの本番ドメインは拒否する", () => {
    expect(getAllowedOrigin(reqWith("http://kjr020.github.io"))).toBeNull();
  });

  it("localhost 以外の 127.0.0.1 は拒否する", () => {
    // 開発用途は localhost のみを明示的に許可する方針
    expect(getAllowedOrigin(reqWith("http://127.0.0.1:4321"))).toBeNull();
  });

  it("localhost を名前に含む偽装ドメインは拒否する", () => {
    // `startsWith("http://localhost:")` は prefix 厳密一致なので OK
    expect(getAllowedOrigin(reqWith("http://localhost.evil.com"))).toBeNull();
  });
});

describe("jsonResponse", () => {
  it("成功時は Cache-Control: public, max-age=300", () => {
    const res = jsonResponse({ ok: true }, 200, reqWith());
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=300");
  });

  it("4xx では Cache-Control: no-store", () => {
    const res = jsonResponse({ error: "bad" }, 400, reqWith());
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("5xx では Cache-Control: no-store", () => {
    const res = jsonResponse({ error: "server" }, 500, reqWith());
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("許可 Origin では Access-Control-Allow-Origin + Vary: Origin を付与", () => {
    const res = jsonResponse({ ok: true }, 200, reqWith("https://kjr020.github.io"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://kjr020.github.io",
    );
    expect(res.headers.get("Vary")).toBe("Origin");
  });

  it("許可外 Origin では Access-Control-Allow-Origin を付与しない", () => {
    const res = jsonResponse({ ok: true }, 200, reqWith("https://evil.com"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("Content-Type: application/json を常に付与", () => {
    const res = jsonResponse({ ok: true }, 200, reqWith());
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });
});
