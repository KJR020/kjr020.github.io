import { describe, expect, it } from "vitest";
import { extractHashtags } from "./hashtag-parser";

describe("extractHashtags", () => {
  it("空白または行頭の # のみをタグとして抽出する", () => {
    expect(extractHashtags(["#設計 #Web"])).toEqual(["Web", "設計"]);
  });

  it("URL fragment の # を抽出しない", () => {
    expect(extractHashtags(["https://example.com/page#section"])).toEqual([]);
  });

  it("Scrapbox ブラケット内の # を抽出しない", () => {
    // [https://example.com#foo] のような URL fragment 含みリンク
    expect(extractHashtags(["[https://example.com#foo] を参照"])).toEqual([]);
  });

  it("ブラケット内のページリンクとハッシュタグが混在しても正しく拾う", () => {
    expect(
      extractHashtags(["[関連ページ] について #設計 のメモ"]),
    ).toEqual(["設計"]);
  });

  it("英語・日本語のタグを抽出できる", () => {
    expect(extractHashtags(["#Rust を学ぶ #言語"])).toEqual(["Rust", "言語"]);
  });

  it("複数行の descriptions からタグを集める", () => {
    expect(
      extractHashtags(["タイトル", "#設計 のメモ", "詳細は [リンク] 参照", "#DDD"]),
    ).toEqual(["DDD", "設計"]);
  });

  it("重複タグは1つにまとめる", () => {
    expect(extractHashtags(["#設計 について #設計 のメモ"])).toEqual(["設計"]);
  });

  it("タグがなければ空配列を返す", () => {
    expect(extractHashtags(["ただのメモ"])).toEqual([]);
  });

  it("空の descriptions で空配列を返す", () => {
    expect(extractHashtags([])).toEqual([]);
  });

  it("単語の途中の # は抽出しない (例: foo#bar)", () => {
    expect(extractHashtags(["word#notTag"])).toEqual([]);
  });

  it("タグ内の _ をスペースに正規化する (Scrapbox 慣例)", () => {
    expect(extractHashtags(["#Claude_Code を使う"])).toEqual(["Claude Code"]);
  });

  it("`_` で区切られた同じ概念は単一タグにまとまる", () => {
    expect(
      extractHashtags(["#Claude_Code について", "詳細 #Claude_Code メモ"]),
    ).toEqual(["Claude Code"]);
  });
});
