import { cn } from "@/lib/utils";

interface TagItem {
  name: string;
  count: number;
}

interface TagBubbleCloudProps {
  tags: TagItem[];
}

export function TagBubbleCloud({ tags }: TagBubbleCloudProps) {
  const handleClick = (tagName: string) => {
    window.location.search = `?q=${encodeURIComponent(tagName)}`;
  };

  return (
    <nav aria-label="タグクラウド" className="flex flex-wrap items-center gap-phi-xs">
      {tags.map((tag) => (
        <button
          key={tag.name}
          type="button"
          onClick={() => handleClick(tag.name)}
          className={cn(
            "inline-flex items-center rounded-full border border-border",
            "bg-secondary text-secondary-foreground",
            "px-3 py-1 text-sm font-medium",
            "transition-colors hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        >
          {tag.name}
          <span className="ml-1.5 text-xs text-muted-foreground">{tag.count}</span>
        </button>
      ))}
    </nav>
  );
}
