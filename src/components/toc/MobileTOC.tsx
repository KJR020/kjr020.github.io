import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MobileTOCProps } from "./types";

/**
 * モバイル用折りたたみ目次コンポーネント
 * アコーディオン形式で展開/折りたたみ
 */
export function MobileTOC({ headings, activeId, onItemClick }: MobileTOCProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
    }

    onItemClick?.(id);
    setIsOpen(false); // クリック後に閉じる
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-y border-border py-phi-xs lg:hidden"
    >
      <Collapsible.Trigger
        className={cn(
          "inline-flex min-h-11 items-center gap-2 px-1 py-2",
          "rounded text-sm font-medium text-foreground",
          "hover:text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors",
        )}
        aria-expanded={isOpen}
        aria-label={`目次を${isOpen ? "閉じる" : "開く"}`}
      >
        <List className="w-4 h-4" aria-hidden="true" />
        <span>目次</span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </Collapsible.Trigger>

      <Collapsible.Content
        className={cn(
          "overflow-hidden",
          "data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp",
        )}
      >
        <nav className="mt-1 border-l border-border pl-4" aria-label="目次">
          <ul className="space-y-1 text-sm">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              const isH3 = heading.level === 3;

              return (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "block rounded-sm py-2 transition-colors duration-200",
                      "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
        </nav>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
