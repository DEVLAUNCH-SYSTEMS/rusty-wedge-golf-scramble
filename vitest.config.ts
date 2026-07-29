import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.{test,spec}.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.{test,spec}.ts"],
          setupFiles: ["tests/integration/load-env.ts"],
          // Shared CI/dev DB: many suites mutate the single active tournament row
          // (lifecycle, capacity, registration_enabled). Run files sequentially.
          fileParallelism: false,
        },
      },
      {
        extends: true,
        test: {
          name: "public-privacy",
          include: ["tests/public-privacy/**/*.{test,spec}.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
