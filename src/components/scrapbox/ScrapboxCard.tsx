import { FileText } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useImageLazyLoad } from "@/hooks/useImageLazyLoad";
import { cn } from "@/lib/utils";
import type { ScrapboxPageData } from "@/types/scrapbox";

interface ScrapboxCardProps {
  page: ScrapboxPageData;
  className?: string;
  isActive?: boolean;
}

export function ScrapboxCard({ page, className, isActive = true }: ScrapboxCardProps) {
  const { ref, isInView, isLoaded, onLoad } = useImageLazyLoad();

  return (
    <a
      href={page.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      data-testid="scrapbox-card"
    >
      <Card
        className={cn(
          "h-full overflow-hidden transition-all duration-200 hover:shadow-md",
          className,
        )}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          {page.imageUrl ? (
            <img
              ref={ref}
              src={isInView ? page.imageUrl : undefined}
              alt={page.title}
              onLoad={onLoad}
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          ) : (
            <div
              data-testid="image-placeholder"
              className="flex h-full w-full items-center justify-center"
            >
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium line-clamp-2">{page.title}</CardTitle>
          <CardDescription
            data-testid="card-description"
            className={cn(
              "line-clamp-2 text-xs mt-1 transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            {page.description || "No description"}
          </CardDescription>
        </CardHeader>
      </Card>
    </a>
  );
}
