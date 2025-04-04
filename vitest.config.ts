import { defineConfig, defaultExclude } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path"; // pathモジュールをインポート

export default defineConfig({
  plugins: [react()],
  resolve: {
    // resolveセクションを追加
    alias: {
      "@": path.resolve(__dirname, "./src"), // tsconfig.jsonのpathsに合わせてエイリアスを設定
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts", // React Testing Library/Jest DOMのセットアップファイル
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "json", "html"], // カバレッジレポートの形式
      // include: ['src/**/*.{ts,tsx}'], // カバレッジ対象のファイル (必要に応じて調整)
      exclude: [...defaultExclude, ".next", "next.config.js"], // カバレッジ除外対象のファイル (必要に応じて調整)
    },
  },
});
