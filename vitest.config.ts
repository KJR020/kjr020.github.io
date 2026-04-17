/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}", "functions/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "functions/**/*.ts",
        "src/lib/**/*.ts",
        "src/hooks/**/*.ts",
        "src/components/knowledge/format.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.d.ts",
        "**/*.astro",
        "**/__mocks__/**",
        "node_modules/**",
        "dist/**",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 80,
      },
    },
  },
});
