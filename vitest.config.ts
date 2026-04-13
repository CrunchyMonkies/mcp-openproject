import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    pool: "forks",
    setupFiles: ["dotenv/config"],
    env: {
      DOTENV_CONFIG_PATH: ".env.test",
    },
  },
});
