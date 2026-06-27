import { describe, expect, it } from "vitest";
import { findForbiddenPublicPageFiles } from "./publicBuildInputs";

describe("findForbiddenPublicPageFiles", () => {
  it("detects local instruction files in public build inputs", () => {
    const files = [
      "src/pages/CLAUDE.md",
      "src/pages/posts/CLAUDE.md",
      "src/pages/posts.astro",
      "public/data/CLAUDE.md",
      "scripts/CLAUDE.md",
      "CLAUDE.md",
    ];

    expect(findForbiddenPublicPageFiles(files)).toEqual([
      "public/data/CLAUDE.md",
      "src/pages/CLAUDE.md",
      "src/pages/posts/CLAUDE.md",
    ]);
  });
});
