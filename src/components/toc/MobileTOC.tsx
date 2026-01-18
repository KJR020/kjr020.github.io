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
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="lg:hidden">
      <Collapsible.Trigger
        className={cn(
          "flex items-center justify-between w-full px-4 py-3",
          "bg-card border border-border rounded-lg",
          "text-sm font-medium text-foreground",
          "hover:bg-accent transition-colors",
        )}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <List className="w-4 h-4" />
          目次
        </span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </Collapsible.Trigger>

      <Collapsible.Content
        className={cn(
          "overflow-hidden",
          "data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp",
        )}
      >
        <nav className="mt-2 px-4 py-3 bg-card border border-border rounded-lg" aria-label="目次">
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
                      "block py-1 transition-colors duration-200",
                      "hover:text-foreground",
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
