import { personBySlug } from "./data/people.ts";
import { workBySlug } from "./data/works.ts";
import {
  homePage,
  matchRoute,
  notFoundPage,
  personPage,
  shell,
  studioPage,
  workDetailPage,
  workIndexPage,
  type Route,
} from "./pages.ts";
import { locationParts } from "./url.ts";
import "./style.css";

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Missing #app");

function view(route: Route): { title: string; html: string } {
  switch (route.page) {
    case "home":
      return homePage();
    case "work":
      return workIndexPage(route.show);
    case "work-detail": {
      const work = workBySlug(route.slug);
      return work ? workDetailPage(work) : notFoundPage();
    }
    case "person": {
      const person = personBySlug(route.slug);
      return person ? personPage(person) : notFoundPage();
    }
    case "studio":
      return studioPage();
    default:
      return notFoundPage();
  }
}

function render(scroll: boolean): void {
  const { pathname, search } = locationParts();
  const route = matchRoute(pathname, search);
  const page = view(route);
  document.title = page.title;
  app!.innerHTML = shell(route, page.html);
  if (!scroll) return;
  window.scrollTo(0, 0);
  const heading = document.querySelector("#main h1");
  if (heading instanceof HTMLElement) {
    heading.tabIndex = -1;
    heading.focus();
  }
}

function toggleCredits(button: HTMLButtonElement): void {
  const panelId = button.getAttribute("aria-controls");
  if (!panelId) return;
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const open = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", open ? "false" : "true");
  panel.hidden = open;
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const creditsButton = target.closest("button[data-credits-toggle]");
  if (creditsButton instanceof HTMLButtonElement) {
    toggleCredits(creditsButton);
    return;
  }

  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.target && anchor.target !== "_self") return;
  if (anchor.hasAttribute("download")) return;
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("#")) return;

  let dest: URL;
  try {
    dest = new URL(anchor.href);
  } catch {
    return;
  }
  if (dest.origin !== window.location.origin) return;
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  ) {
    return;
  }

  const next = `${dest.pathname}${dest.search}${dest.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) {
    event.preventDefault();
    return;
  }
  event.preventDefault();
  history.pushState(null, "", next);
  render(true);
});

window.addEventListener("popstate", () => {
  render(false);
});

render(false);
