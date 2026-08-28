import * as Collapsible from "@radix-ui/react-collapsible";
import { List, PanelRightClose } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileTOC } from "./MobileTOC";
import { TOCList } from "./TOCList";
import type { TableOfContentsProps } from "./types";
import { useScrollSpy } from "./useScrollSpy";

/**
 * 目次コンポーネント
 * デスクトップ: 開閉できる右側スティッキー表示
 * モバイル: 折りたたみアコーディオン表示
 */
export function TableOfContents({
  headings,
  variant = "responsive",
  className,
  avatarSrc,
  avatarAlt,
}: TableOfContentsProps) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const headingIds = headings.map((h) => h.id);
  const { activeId } = useScrollSpy(headingIds);

  // 見出しがない場合は何も表示しない
  if (headings.length === 0) {
    return null;
  }

  const showsMobile = variant === "responsive" || variant === "mobile";
  const showsDesktop = variant === "responsive" || variant === "desktop";

  return (
    <>
      {/* モバイル表示: 折りたたみアコーディオン */}
      {showsMobile && <MobileTOC headings={headings} activeId={activeId} />}

      {/* デスクトップ表示: スティッキーサイドバー */}
      {showsDesktop && (
        <Collapsible.Root
          open={isDesktopOpen}
          onOpenChange={setIsDesktopOpen}
          className={cn("hidden lg:block", "sticky top-24", className)}
          data-desktop-toc-open={isDesktopOpen ? "true" : "false"}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isDesktopOpen ? "mb-4 justify-between pl-8" : "justify-end",
            )}
          >
            {isDesktopOpen && <h2 className="text-sm font-semibold text-foreground">目次</h2>}
            <Collapsible.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={isDesktopOpen ? "目次を隠す" : "目次を表示"}
              >
                {isDesktopOpen ? (
                  <PanelRightClose aria-hidden="true" />
                ) : (
                  <List aria-hidden="true" />
                )}
              </Button>
            </Collapsible.Trigger>
          </div>

          <Collapsible.Content asChild>
            <nav
              className="max-h-[calc(100vh-11rem)] overflow-y-auto pl-8"
              aria-label="目次"
              data-toc-scroll-container="true"
            >
              <TOCList
                headings={headings}
                activeId={activeId}
                avatarSrc={avatarSrc}
                avatarAlt={avatarAlt}
              />
            </nav>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </>
  );
}
