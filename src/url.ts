/** Prefix a site path with Vite's base. Base is "/" for the custom domain. */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [pathname, search = ""] = path.split("?");
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const suffix = search ? `?${search}` : "";
  if (normalized === "/") return `${base}/${suffix}`;
  return `${base}${normalized}${suffix}`;
}

/** Public file under `public/`, prefixed with the Vite base. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export function locationParts(): { pathname: string; search: string } {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let pathname = window.location.pathname;
  if (base && (pathname === base || pathname.startsWith(`${base}/`))) {
    pathname = pathname.slice(base.length) || "/";
  }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return { pathname, search: window.location.search };
}

export function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
