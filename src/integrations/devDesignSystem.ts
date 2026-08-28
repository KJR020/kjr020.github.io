import type { AstroIntegration } from "astro";

/**
 * 開発サーバーでだけデザインシステムを公開する。
 *
 * ページ本体を `src/pages` の外に置き、production build へ混入しないことを
 * integration の責務として保証する。
 */
export function devDesignSystem(): AstroIntegration {
  return {
    name: "kjr020:dev-design-system",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command !== "dev") {
          return;
        }

        injectRoute({
          pattern: "/design-system",
          entrypoint: new URL("../design-system/pages/index.astro", import.meta.url),
        });
        injectRoute({
          pattern: "/design-system/foundations",
          entrypoint: new URL("../design-system/pages/foundations.astro", import.meta.url),
        });
        injectRoute({
          pattern: "/design-system/components",
          entrypoint: new URL("../design-system/pages/components.astro", import.meta.url),
        });
        injectRoute({
          pattern: "/design-system/patterns",
          entrypoint: new URL("../design-system/pages/patterns.astro", import.meta.url),
        });
        injectRoute({
          pattern: "/design-system/content",
          entrypoint: new URL("../design-system/pages/content.astro", import.meta.url),
        });
        injectRoute({
          pattern: "/design-system/governance",
          entrypoint: new URL("../design-system/pages/governance.astro", import.meta.url),
        });
        injectRoute({
          pattern: "/design-system/patterns/article-reading",
          entrypoint: new URL(
            "../design-system/pages/article-reading-redirect.astro",
            import.meta.url,
          ),
        });
        injectRoute({
          pattern: "/design-system/article-reading",
          entrypoint: new URL(
            "../design-system/pages/article-reading-redirect.astro",
            import.meta.url,
          ),
        });
      },
    },
  };
}
