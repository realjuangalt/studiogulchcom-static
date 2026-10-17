import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const SITE_ORIGIN = "https://studiogulch.com";

interface RouteMetadata {
  title: string;
  description: string;
  ogImage: string;
}

const routePages: Record<string, RouteMetadata> = {
  "work-with-us": {
    title: "Work with us — Studio Gulch",
    description:
      "Short illustrated brand films. Made with machines, cut like film.",
    ogImage: `${SITE_ORIGIN}/logo.png`,
  },
};

function buildMetaTags(meta: RouteMetadata): string {
  return `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.ogImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.ogImage}" />`;
}

function githubPagesFallback(): Plugin {
  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    closeBundle() {
      const dist = resolve(process.cwd(), "dist");
      const indexHtml = readFileSync(resolve(dist, "index.html"), "utf-8");

      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));

      for (const [route, meta] of Object.entries(routePages)) {
        const routeDir = resolve(dist, route);
        mkdirSync(routeDir, { recursive: true });

        let routeHtml = indexHtml
          .replace(/<title>[^<]*<\/title>/, "")
          .replace(
            /<meta\s+name="description"[^>]*>/,
            "",
          );

        routeHtml = routeHtml.replace(
          "</head>",
          `${buildMetaTags(meta)}
  </head>`,
        );

        writeFileSync(resolve(routeDir, "index.html"), routeHtml);
      }
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
