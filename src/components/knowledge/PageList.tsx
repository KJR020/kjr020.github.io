"use client";

import { ExternalLink, Link, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KnowledgePageData } from "@/types/knowledge";
import { formatRelativeDate, scrapboxUrl } from "./format";

interface PageListProps {
  pages: KnowledgePageData[];
  selectedTag: string | null;
  onClose: () => void;
  project?: string;
}

export function PageList({ pages, selectedTag, onClose, project = "KJR020" }: PageListProps) {
  if (!selectedTag) return null;

  const sortedPages = [...pages].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <section
      className={cn(
        "rounded-lg border bg-card shadow-lg",
        "flex flex-col",
        "max-h-[360px]",
        "animate-fade-in-up",
      )}
      aria-label={`${selectedTag} のページ一覧`}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">{selectedTag}</h3>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {sortedPages.length}件
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "shrink-0 rounded-md p-1",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-muted transition-colors",
          )}
          aria-label="パネルを閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {sortedPages.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            ページが見つかりません
          </li>
        ) : (
          sortedPages.map((page) => (
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
                  <span className="flex items-start gap-1 text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {page.title}
                    <ExternalLink
                      className="h-3 w-3 shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <time dateTime={page.updatedAt}>{formatRelativeDate(page.updatedAt)}</time>
                    <span className="flex items-center gap-1" title="被リンク数">
                      <Link className="h-3 w-3" aria-hidden="true" />
                      {page.linked}
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export type { PageListProps };
