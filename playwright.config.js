import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm.cmd start --prefix Backend",
      url: "http://localhost:5000/api/health",
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: "npm.cmd run dev -- --host localhost",
      url: "http://localhost:5173",
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
