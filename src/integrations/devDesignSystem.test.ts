import { describe, expect, it, vi } from "vitest";

import { devDesignSystem } from "./devDesignSystem";

type InjectedRoute = {
  entrypoint: URL | string;
  pattern: string;
};

type SetupHook = (options: {
  command: "build" | "dev" | "preview" | "sync";
  injectRoute: (route: InjectedRoute) => void;
}) => Promise<void> | void;

function getDesignSystemSetupHook(): SetupHook {
  const integration = devDesignSystem();

  expect(integration.name).toBe("kjr020:dev-design-system");

  return integration.hooks["astro:config:setup"] as unknown as SetupHook;
}

describe("devDesignSystem integration", () => {
  it("開発サーバーでは6つのデザインシステムページと互換ルートを注入する", async () => {
    const injectRoute = vi.fn<(route: InjectedRoute) => void>();

    await getDesignSystemSetupHook()({ command: "dev", injectRoute });

    expect(injectRoute.mock.calls.map(([route]) => route.pattern)).toEqual([
      "/design-system",
      "/design-system/foundations",
      "/design-system/components",
      "/design-system/patterns",
      "/design-system/content",
      "/design-system/governance",
      "/design-system/patterns/article-reading",
      "/design-system/article-reading",
    ]);
  });

  it.each(["build", "preview", "sync"] as const)("%s ではルートを注入しない", async (command) => {
    const injectRoute = vi.fn<(route: InjectedRoute) => void>();

    await getDesignSystemSetupHook()({ command, injectRoute });

    expect(injectRoute).not.toHaveBeenCalled();
  });
});
