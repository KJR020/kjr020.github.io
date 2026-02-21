import { List } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileTOC } from "./MobileTOC";
import { TOCList } from "./TOCList";
import type { TableOfContentsProps } from "./types";
import { useScrollSpy } from "./useScrollSpy";

/**
 * 目次コンポーネント
 * デスクトップ: 右側スティッキー表示
 * モバイル: 折りたたみアコーディオン表示
 */
export function TableOfContents({
  headings,
  className,
  avatarSrc,
  avatarAlt,
}: TableOfContentsProps) {
  const headingIds = headings.map((h) => h.id);
  const { activeId } = useScrollSpy(headingIds);

  // 見出しがない場合は何も表示しない
  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      {/* モバイル表示: 折りたたみアコーディオン */}
      <MobileTOC headings={headings} activeId={activeId} />

      {/* デスクトップ表示: スティッキーサイドバー */}
      <nav
        className={cn(
          "hidden lg:block",
          "sticky top-24",
          "max-h-[calc(100vh-8rem)] overflow-y-auto",
          "pl-8",
          className,
        )}
        aria-label="目次"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
          <List className="w-4 h-4" />
          目次
        </h2>
        <TOCList
          headings={headings}
          activeId={activeId}
          avatarSrc={avatarSrc}
          avatarAlt={avatarAlt}
        />
      </nav>
    </>
  );
}
