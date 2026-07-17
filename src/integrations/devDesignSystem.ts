import type { AstroIntegration } from "astro";

/**
 * 開発サーバーでだけ Living Design System を公開する。
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
      },
    },
  };
}
