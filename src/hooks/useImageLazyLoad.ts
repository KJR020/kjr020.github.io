import { useRef, useState, useEffect, useCallback } from "react";

interface UseImageLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
}

interface UseImageLazyLoadResult {
  ref: React.RefObject<HTMLImageElement | null>;
  isInView: boolean;
  isLoaded: boolean;
  onLoad: () => void;
}

export function useImageLazyLoad(
  options?: UseImageLazyLoadOptions
): UseImageLazyLoadResult {
  const ref = useRef<HTMLImageElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: options?.rootMargin ?? "200px",
        threshold: options?.threshold ?? 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options?.rootMargin, options?.threshold]);

  return { ref, isInView, isLoaded, onLoad };
}
