import type { HeadingItem } from "./types";

export function hasTableOfContents(headings: readonly HeadingItem[]): boolean {
  return headings.length > 0;
}
