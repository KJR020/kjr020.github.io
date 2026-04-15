import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeDate, scrapboxUrl } from "./format";

describe("scrapboxUrl", () => {
  it("プロジェクト名とタイトルで URL を組み立てる", () => {
    expect(scrapboxUrl("KJR020", "TypeScript")).toBe("https://scrapbox.io/KJR020/TypeScript");
  });

  it("タイトル中の特殊文字を URL エンコードする", () => {
    expect(scrapboxUrl("KJR020", "Claude Code")).toBe("https://scrapbox.io/KJR020/Claude%20Code");
  });

  it("日本語タイトルをエンコードする", () => {
    expect(scrapboxUrl("KJR020", "設計")).toBe("https://scrapbox.io/KJR020/%E8%A8%AD%E8%A8%88");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("同日なら「今日」を返す", () => {
    expect(formatRelativeDate("2026-04-14T09:00:00.000Z")).toBe("今日");
  });

  it("1日前なら「昨日」", () => {
    expect(formatRelativeDate("2026-04-13T12:00:00.000Z")).toBe("昨日");
  });

  it("1週間未満は日数", () => {
    expect(formatRelativeDate("2026-04-11T12:00:00.000Z")).toBe("3日前");
  });

  it("1ヶ月未満は週", () => {
    expect(formatRelativeDate("2026-04-01T12:00:00.000Z")).toBe("1週間前");
  });

  it("1年未満は月", () => {
    // 2026-01-14 → 2026-04-14 = 90日 → 3ヶ月前
    expect(formatRelativeDate("2026-01-14T12:00:00.000Z")).toBe("3ヶ月前");
  });

  it("1年以上は年", () => {
    expect(formatRelativeDate("2024-04-14T12:00:00.000Z")).toBe("2年前");
  });

  it("クロックスキューで未来日付になっても負値を返さない", () => {
    expect(formatRelativeDate("2026-04-15T12:00:00.000Z")).toBe("今日");
  });
});
