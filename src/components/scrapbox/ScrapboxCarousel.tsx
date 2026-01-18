import useEmblaCarousel from "embla-carousel-react";
import { AlertCircle, ChevronLeft, ChevronRight, FileQuestion, RefreshCw } from "lucide-react";
import { useCallback } from "react";
import { QueryProvider } from "@/components/QueryProvider";
import { Button } from "@/components/ui/button";
import { useScrapboxData } from "@/hooks/useScrapboxData";
import { cn } from "@/lib/utils";
import { ScrapboxCard } from "./ScrapboxCard";

interface ScrapboxCarouselProps {
  project: string;
  limit?: number;
  className?: string;
}

function ScrapboxCarouselInner({ project, limit = 10, className }: ScrapboxCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  });

  const { data, isLoading, isError, error, refetch } = useScrapboxData(project, { limit });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // project 未指定
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">プロジェクト名を指定してください</p>
      </div>
    );
  }

  // ローディング
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // エラー
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error?.message || "データの取得に失敗しました"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          再試行
        </Button>
      </div>
    );
  }

  // データ 0 件
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">ページが見つかりません</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Navigation Buttons */}
      <div className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 hidden md:block">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">前へ</span>
        </Button>
      </div>
      <div className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 hidden md:block">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
          onClick={scrollNext}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">次へ</span>
        </Button>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {data.map((page) => (
            <div key={page.id} className="flex-none w-[280px] md:w-[320px]">
              <ScrapboxCard page={page} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <p className="mt-4 text-center text-sm text-muted-foreground md:hidden">
        ← スワイプして他のカードを見る →
      </p>
    </div>
  );
}

export function ScrapboxCarousel(props: ScrapboxCarouselProps) {
  return (
    <QueryProvider>
      <ScrapboxCarouselInner {...props} />
    </QueryProvider>
  );
}
