"use client";

import { ChevronDown, ExternalLink, Link } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { KnowledgePageData, TagSummary } from "@/types/knowledge";
import { formatRelativeDate, scrapboxUrl } from "./format";

interface TagListProps {
  tags: TagSummary[];
  pages: KnowledgePageData[];
  project?: string;
}

function TagSection({
  tag,
  tagPages,
  project,
}: {
  tag: TagSummary;
  /** 親で事前に抽出・ソート済みのページ配列 */
  tagPages: KnowledgePageData[];
  project: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3",
          "text-left transition-colors hover:bg-accent/50",
          isOpen && "border-b",
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{tag.name}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tag.count}件
          </span>
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground"
            title="被リンク合計"
          >
            <Link className="h-3 w-3" aria-hidden="true" />
            {tag.totalLinked}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul className="max-h-[300px] overflow-y-auto">
          {tagPages.map((page) => (
            <li key={page.id} className="border-b last:border-b-0">
              <a
                href={scrapboxUrl(project, page.title)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-start justify-between gap-3 px-4 py-2.5",
                  "transition-colors hover:bg-accent/50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <span className="flex items-start gap-1 text-sm text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                    {page.title}
                    <ExternalLink
                      className="h-3 w-3 shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-3 text-xs text-muted-foreground">
                  <time dateTime={page.updatedAt}>{formatRelativeDate(page.updatedAt)}</time>
                  <span className="flex items-center gap-1" title="被リンク数">
                    <Link className="h-3 w-3" aria-hidden="true" />
                    {page.linked}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 未タグページ用の内部センチネル（実在する #未分類 タグと衝突しないようにする） */
const UNTAGGED_KEY = "__untagged__";

export function TagList({ tags, pages, project = "KJR020" }: TagListProps) {
  // ページを1回だけ走査し、タグごとに更新日降順のページ配列を構築
  const pagesByTag = useMemo(() => {
    const map = new Map<string, KnowledgePageData[]>();
    const untagged: KnowledgePageData[] = [];
    for (const page of pages) {
      if (page.hashtags.length === 0) {
        untagged.push(page);
        continue;
      }
      for (const tag of page.hashtags) {
        const list = map.get(tag);
        if (list) list.push(page);
        else map.set(tag, [page]);
      }
    }
    const byDateDesc = (a: KnowledgePageData, b: KnowledgePageData) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    for (const list of map.values()) list.sort(byDateDesc);
    untagged.sort(byDateDesc);
    if (untagged.length > 0) map.set(UNTAGGED_KEY, untagged);
    return map;
  }, [pages]);

  const untaggedPages = pagesByTag.get(UNTAGGED_KEY) ?? [];

  return (
    <div className="flex flex-col gap-2" role="tabpanel" aria-label="一覧ビュー">
      {tags.map((tag) => (
        <TagSection
          key={tag.name}
          tag={tag}
          tagPages={pagesByTag.get(tag.name) ?? []}
          project={project}
        />
      ))}

      {untaggedPages.length > 0 && (
        <TagSection
          tag={{
            name: "未分類",
            count: untaggedPages.length,
            totalLinked: untaggedPages.reduce((sum, p) => sum + p.linked, 0),
            totalLines: untaggedPages.reduce((sum, p) => sum + p.linesCount, 0),
          }}
          tagPages={untaggedPages}
          project={project}
        />
      )}
    </div>
  );
}
