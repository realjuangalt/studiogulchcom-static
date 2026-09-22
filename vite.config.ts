import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * Default "/" is the custom domain at the site root (studiogulch.com).
 * GitHub project pages need "/<repo>/" — the Pages workflow sets VITE_BASE.
 */
function siteBase(): string {
  const fromEnv = process.env.VITE_BASE?.trim();
  if (!fromEnv) return "/";
  const withLead = fromEnv.startsWith("/") ? fromEnv : `/${fromEnv}`;
  return withLead.endsWith("/") ? withLead : `${withLead}/`;
}

const base = siteBase();

function githubPagesFallback(): Plugin {
  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    closeBundle() {
      const dist = resolve(process.cwd(), "dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
    },
  };
}

export default defineConfig({
  base,
  appType: "spa",
  plugins: [githubPagesFallback()],
  server: {
    host: "0.0.0.0",
    port: 43123,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 43123,
    strictPort: true,
  },
});
