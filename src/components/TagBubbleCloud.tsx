import { cn } from "@/lib/utils";

interface TagItem {
  name: string;
  count: number;
}

interface TagBubbleCloudProps {
  tags: TagItem[];
}

const MIN_SIZE = 0.75;
const MAX_SIZE = 1.5;

function calculateSize(count: number, maxCount: number): number {
  if (maxCount <= 1) return (MIN_SIZE + MAX_SIZE) / 2;
  return MIN_SIZE + (MAX_SIZE - MIN_SIZE) * (Math.log(count) / Math.log(maxCount));
}

export function TagBubbleCloud({ tags }: TagBubbleCloudProps) {
  const maxCount = Math.max(...tags.map((t) => t.count));

  const handleClick = (tagName: string) => {
    window.location.search = `?q=${encodeURIComponent(tagName)}`;
  };

  return (
    <nav
      aria-label="タグクラウド"
      className="flex flex-wrap items-center justify-center gap-phi-xs"
    >
      {tags.map((tag, index) => {
        const size = calculateSize(tag.count, maxCount);
        const delay = ((index * 0.4) % 3).toFixed(2);
        const duration = (3 + ((index * 0.7) % 2)).toFixed(2);

        return (
          <button
            key={tag.name}
            type="button"
            onClick={() => handleClick(tag.name)}
            className={cn(
              "animate-float",
              "inline-flex items-center rounded-full border border-border",
              "bg-secondary text-secondary-foreground",
              "px-3 py-1 font-medium",
              "transition-colors hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            )}
            style={{
              fontSize: `${size}rem`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            {tag.name}
            <span className="ml-1.5 text-muted-foreground" style={{ fontSize: "0.75em" }}>
              {tag.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
