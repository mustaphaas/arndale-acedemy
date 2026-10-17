import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const fromRoot = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  root: fromRoot("./local"),
  publicDir: fromRoot("./public"),
  plugins: [
    tailwindcss(),
    {
      name: "local-demo-browser-boundary",
      generateBundle() {
        const serverModule = [...this.getModuleIds()].find(
          (id) =>
            id.includes("/@agent-native/core/") ||
            id.startsWith(fromRoot("./server/")) ||
            id.startsWith(fromRoot("./actions/")) ||
            id === fromRoot("./app/root.tsx"),
        );
        if (serverModule)
          this.error(
            "The local demo must not include server or authentication modules: " +
              serverModule,
          );
      },
    },
  ],
  resolve: {
    alias: [
      {
        find: "@/lib/assignment-hooks",
        replacement: fromRoot("./local/assignment-hooks.ts"),
      },
      {
        find: "@/lib/portal-session",
        replacement: fromRoot("./local/portal-session.ts"),
      },
      { find: "@", replacement: fromRoot("./app") },
    ],
  },
  esbuild: { jsx: "automatic" },
  server: { fs: { allow: [fromRoot("./")] } },
  build: { outDir: fromRoot("./dist-local"), emptyOutDir: true },
});
