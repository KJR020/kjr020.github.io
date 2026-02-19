import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { TOCListProps } from "./types";

/**
 * 目次リストコンポーネント
 * 見出しの階層構造を維持して表示し、アクティブな項目をハイライト
 */
export function TOCList({
  headings,
  activeId,
  onItemClick,
  avatarSrc,
  avatarAlt = "Avatar",
}: TOCListProps) {
  const activeRef = useRef<HTMLLIElement>(null);

  // アクティブ項目が変わったら、TOCサイドバー内で見える位置にスクロール
  useEffect(() => {
    if (!activeId || !activeRef.current) return;
    activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId]);
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    // スムーズスクロール
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });

      // URLハッシュを更新（クリック時のみ）
      history.pushState(null, "", `#${id}`);
    }

    onItemClick?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, id);
    }
  };

  return (
    <ul className="space-y-1 text-sm">
      {headings.map((heading) => {
        const isActive = activeId === heading.id;
        const isH3 = heading.level === 3;

        return (
          <li key={heading.id} ref={isActive ? activeRef : undefined} className="relative">
            {/* アバターアイコン（デスクトップのみ、アクティブ時） */}
            {avatarSrc && isActive && (
              <img
                src={avatarSrc}
                alt={avatarAlt}
                className={cn(
                  "absolute -left-6 top-1/2 -translate-y-1/2",
                  "w-5 h-5 rounded-full",
                  "transition-all duration-300 ease-in-out",
                )}
              />
            )}
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              onKeyDown={(e) => handleKeyDown(e, heading.id)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "block py-1 transition-colors duration-200",
                "hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 rounded",
                isH3 && "pl-4",
                isActive ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
