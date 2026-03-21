/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TagBubbleCloud } from "./TagBubbleCloud";

const mockTags = [
  { name: "astro", count: 5 },
  { name: "react", count: 3 },
  { name: "typescript", count: 1 },
];

describe("TagBubbleCloud", () => {
  it("すべてのタグがボタンとしてレンダリングされる", () => {
    render(<TagBubbleCloud tags={mockTags} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("タグ名と件数が表示される", () => {
    render(<TagBubbleCloud tags={mockTags} />);
    expect(screen.getByText("astro")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("件数が多いタグほどフォントサイズが大きい", () => {
    render(<TagBubbleCloud tags={mockTags} />);
    const astroButton = screen.getByText("astro").closest("button");
    const tsButton = screen.getByText("typescript").closest("button");
    if (!astroButton || !tsButton) throw new Error("buttons not found");

    const astroSize = Number.parseFloat(astroButton.style.fontSize);
    const tsSize = Number.parseFloat(tsButton.style.fontSize);

    expect(astroSize).toBeGreaterThan(tsSize);
  });

  it("アニメーション遅延と持続時間がstyleに設定される", () => {
    render(<TagBubbleCloud tags={mockTags} />);
    const firstButton = screen.getByText("astro").closest("button");
    if (!firstButton) throw new Error("button not found");
    expect(firstButton.style.animationDelay).toBeTruthy();
    expect(firstButton.style.animationDuration).toBeTruthy();
  });

  it("空のタグ配列で何もレンダリングされない", () => {
    render(<TagBubbleCloud tags={[]} />);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("タグが1つだけの場合でも正しくレンダリングされる", () => {
    render(<TagBubbleCloud tags={[{ name: "solo", count: 1 }]} />);
    expect(screen.getByText("solo")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("aria-labelがタグクラウドコンテナに設定される", () => {
    render(<TagBubbleCloud tags={mockTags} />);
    expect(screen.getByLabelText("タグクラウド")).toBeInTheDocument();
  });
});
