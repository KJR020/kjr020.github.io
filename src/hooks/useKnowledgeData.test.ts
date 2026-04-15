import { describe, expect, it } from "vitest";
import type { KnowledgePageData } from "@/types/knowledge";
import { summarizeTags } from "./useKnowledgeData";

function page(
  id: string,
  hashtags: string[],
  overrides?: Partial<KnowledgePageData>,
): KnowledgePageData {
  return {
    id,
    title: id,
    hashtags,
    updatedAt: "2026-04-14T00:00:00Z",
    linked: 1,
    linesCount: 10,
    views: 0,
    ...overrides,
  };
}

describe("summarizeTags", () => {
  it("ページ数降順でソートする", () => {
    const pages = [
      page("a", ["A"]),
      page("b", ["B"]),
      page("c", ["A"]),
      page("d", ["A"]),
      page("e", ["B"]),
    ];
    const tags = summarizeTags(pages);
    expect(tags.map((t) => t.name)).toEqual(["A", "B"]);
    expect(tags[0].count).toBe(3);
    expect(tags[1].count).toBe(2);
  });

  it("ページ数が同じなら totalLinked 降順でタイブレークする", () => {
    const pages = [
      page("a", ["low"], { linked: 1 }),
      page("b", ["low"], { linked: 1 }),
      page("c", ["high"], { linked: 10 }),
      page("d", ["high"], { linked: 10 }),
    ];
    const tags = summarizeTags(pages);
    expect(tags.map((t) => t.name)).toEqual(["high", "low"]);
  });

  it("totalLinked / totalLines を正しく合計する", () => {
    const pages = [
      page("a", ["X"], { linked: 3, linesCount: 100 }),
      page("b", ["X"], { linked: 7, linesCount: 50 }),
    ];
    const tags = summarizeTags(pages);
    expect(tags[0]).toMatchObject({
      name: "X",
      count: 2,
      totalLinked: 10,
      totalLines: 150,
    });
  });

  it("1ページが複数タグを持つ場合、それぞれのタグ配下に現れる", () => {
    const pages = [page("a", ["A", "B"]), page("b", ["A"])];
    const tags = summarizeTags(pages);
    expect(tags.find((t) => t.name === "A")?.count).toBe(2);
    expect(tags.find((t) => t.name === "B")?.count).toBe(1);
  });

  it("タグのないページは集計対象外", () => {
    const pages = [page("a", []), page("b", ["X"])];
    const tags = summarizeTags(pages);
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe("X");
  });

  it("空配列なら空を返す", () => {
    expect(summarizeTags([])).toEqual([]);
  });
});
