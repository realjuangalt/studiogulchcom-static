import { frameMarkup } from "./frames.ts";
import { personById, profilePeople } from "./data/people.ts";
import { liveSocials } from "./data/socials.ts";
import {
  creditsForPerson,
  featuredWorks,
  filterKindsFor,
  isWorkKindId,
  kindFilterLabel,
  kindLabel,
  works,
} from "./data/works.ts";
import type { Credit, Person, Social, Work, WorkKindId } from "./data/types.ts";
import { asset, esc, url } from "./url.ts";

export type WorkTypeFilter = "all" | WorkKindId;

export type Route =
  | { page: "home" }
  | { page: "work"; show: "all" | "published"; type: WorkTypeFilter }
  | { page: "work-detail"; slug: string }
  | { page: "person"; slug: string }
  | { page: "studio" }
  | { page: "work-with-us" }
  | { page: "not-found" };

function parseWorkType(raw: string | null): WorkTypeFilter {
  if (!raw || raw === "all") return "all";
  return isWorkKindId(raw) ? raw : "all";
}

/** Build /work query string. Default view: published + all types. */
function workIndexHref(
  show: "all" | "published",
  type: WorkTypeFilter,
): string {
  const params = new URLSearchParams();
  if (show === "all") params.set("show", "all");
  if (type !== "all") params.set("type", type);
  const query = params.toString();
  return query ? `/work?${query}` : "/work";
}

export function matchRoute(pathname: string, search: string): Route {
  const params = new URLSearchParams(search);
  if (pathname === "/") return { page: "home" };
  if (pathname === "/work") {
    return {
      page: "work",
      // Default catalogue view is published work; samples stay under ?show=all.
      show: params.get("show") === "all" ? "all" : "published",
      // Default type is All (every kind). Short films / Shorts chips always list.
      type: parseWorkType(params.get("type")),
    };
  }
  if (pathname === "/studio") return { page: "studio" };
  if (pathname === "/work-with-us") return { page: "work-with-us" };
  const work = /^\/work\/([a-z0-9-]+)$/.exec(pathname);
  if (work) return { page: "work-detail", slug: work[1] };
  const person = /^\/people\/([a-z0-9-]+)$/.exec(pathname);
  if (person) return { page: "person", slug: person[1] };
  return { page: "not-found" };
}

function external(href: string, label: string, handle?: string): string {
  const extra = handle
    ? ` <span class="handle">${esc(handle)}</span>`
    : "";
  return `<a href="${esc(href)}" rel="noreferrer" target="_blank">${esc(label)}${extra}</a>`;
}

function socialItems(socials: Array<Social & { href: string }>): string {
  return socials
    .map(
      (social) =>
        `<li>${external(social.href, social.label, social.handle)}</li>`,
    )
    .join("");
}

export function shell(route: Route, inner: string): string {
  const workCurrent = route.page === "work" || route.page === "work-detail";
  const studioCurrent = route.page === "studio" || route.page === "person";
  const socials = liveSocials();
  const socialList =
    socials.length > 0
      ? `<ul class="socials">${socials
          .map(
            (social) =>
              `<li>${external(social.href, social.label)}</li>`,
          )
          .join("")}</ul>`
      : "";

  return `
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="${url("/")}">
          <span class="logo-crop logo-crop-sm">
            <img src="${asset("logo.png")}" alt="" width="1400" height="1400" />
          </span>
          <span class="brand-name">Studio Gulch</span>
        </a>
        <nav class="nav" aria-label="Pages">
          <a href="${url("/work")}"${workCurrent ? ' aria-current="page"' : ""}>Work</a>
          <a href="${url("/studio")}"${studioCurrent ? ' aria-current="page"' : ""}>Studio</a>
          <a href="${url("/work-with-us")}"${route.page === "work-with-us" ? ' aria-current="page"' : ""}>Work with us</a>
        </nav>
      </div>
    </header>
    <main id="main">${inner}</main>
    <footer class="site-footer">
      <div class="wrap footer-inner">
        <p>Studio Gulch</p>
        ${socialList}
      </div>
    </footer>
  `;
}

function paragraphs(text: string): string {
  return text
    .split(/\n\n+/)
    .map((part) => `<p>${esc(part)}</p>`)
    .join("");
}

function visual(work: Work): string {
  if (work.still) {
    return `<img class="still" src="${asset(work.still)}" alt="" />`;
  }
  return frameMarkup(work.frame);
}

function sampleBadge(work: Work): string {
  return work.sample ? `<span class="sample">Sample</span>` : "";
}

function creditName(credit: Credit): string {
  const person = personById(credit.personId);
  const name = esc(person?.name ?? credit.personId);
  if (!person?.slug) return name;
  return `<a href="${url(`/people/${person.slug}`)}">${name}</a>`;
}

function creditItems(work: Work): string {
  if (work.credits.length === 0) {
    return `<li class="credit-note">No credits listed.</li>`;
  }
  return work.credits
    .map((credit) => {
      const note = credit.note
        ? `<span class="credit-note">${esc(credit.note)}</span>`
        : "";
      return `<li><span class="credit-name">${creditName(credit)}</span><span class="credit-role">${esc(credit.role)}</span>${note}</li>`;
    })
    .join("");
}

/** Card: collapsed toggle. Detail: always-open list (no click required). */
function creditsBlock(work: Work, mode: "toggle" | "open" = "toggle"): string {
  const id = `credits-${work.slug}`;
  const items = creditItems(work);
  const label = `Credits · ${work.credits.length}`;

  if (mode === "open") {
    return `
    <div class="credits credits-open">
      <h2 class="credits-heading">${esc(label)}</h2>
      <ul id="${id}" class="credits-panel">
        ${items}
      </ul>
    </div>
  `;
  }

  return `
    <div class="credits">
      <button type="button" class="credits-toggle" aria-expanded="false" aria-controls="${id}" data-credits-toggle>
        ${esc(label)}
      </button>
      <ul id="${id}" class="credits-panel" hidden>
        ${items}
      </ul>
    </div>
  `;
}

function frameBox(work: Work, extraClass = ""): string {
  const aspect =
    work.aspect && work.aspect !== "1/1"
      ? ` data-aspect="${esc(work.aspect)}"`
      : "";
  const cls = extraClass ? `frame ${extraClass}` : "frame";
  return `
        <div class="${cls}"${aspect}>
          <div class="frame-art" aria-hidden="true">${visual(work)}</div>
          ${sampleBadge(work)}
        </div>`;
}

function card(work: Work, heading: "h2" | "h3"): string {
  return `
    <article class="card"${work.sample ? ' data-sample="true"' : ""}>
      <a class="card-link" href="${url(`/work/${work.slug}`)}">
        ${frameBox(work)}
        <p class="kind">${esc(kindLabel(work.kind))}</p>
        <${heading}>${esc(work.title)}</${heading}>
        <p class="summary">${esc(work.summary)}</p>
      </a>
      ${watchLinks(work)}
      ${creditsBlock(work)}
    </article>
  `;
}

function workGrid(list: Work[], heading: "h2" | "h3"): string {
  return `<div class="grid">${list.map((work) => card(work, heading)).join("")}</div>`;
}

export function homePage(): { title: string; html: string } {
  const featured = featuredWorks(3);
  const published = works.some((work) => !work.sample);
  let recent: string;
  if (featured.length === 0) {
    recent = `
      <section class="recent">
        <h2 class="section-label">Recent</h2>
        <div class="empty"><p class="empty-title">No published work yet</p></div>
      </section>
    `;
  } else {
    const note = published
      ? ""
      : `<p class="deck">Labeled samples. Published work will replace them.</p>`;
    const workIndexLabel = published ? "Work" : "All work";
    recent = `
      <section class="recent">
        <div class="section-head">
          <h2 class="section-label">Recent</h2>
          <a class="text-link" href="${url("/work")}">${workIndexLabel}</a>
        </div>
        ${note}
        ${workGrid(featured, "h3")}
      </section>
    `;
  }

  return {
    title: "Studio Gulch",
    html: `
      <div class="wrap page" data-page="home">
        <div class="home-intro home-intro-reveal">
          <div data-reveal-mount></div>
          <div class="reveal-fallback">
            <div class="logo-crop">
              <img src="${asset("logo.png")}" alt="" width="1400" height="1400" />
            </div>
            <div class="home-copy">
              <h1>Studio Gulch</h1>
              <p class="studio-line">Made with machines. Cut like film.</p>
            </div>
          </div>
        </div>
        ${recent}
      </div>
    `,
  };
}

function emptyTypeCopy(type: WorkKindId): { title: string; deck: string } {
  switch (type) {
    case "shorts":
      return {
        title: "No shorts yet",
        deck: "Short cuts will land here when they are published.",
      };
    case "short-film":
      return {
        title: "No short films yet",
        deck: "Published short films will show up here.",
      };
    case "publicity":
      return {
        title: "No publicity yet",
        deck: "Ads and publicity cuts will show up here.",
      };
    default:
      return {
        title: `No ${kindFilterLabel(type).toLowerCase()} yet`,
        deck: "Pieces of this type will show up here when published.",
      };
  }
}

export function workIndexPage(
  show: "all" | "published",
  type: WorkTypeFilter,
): {
  title: string;
  html: string;
} {
  const publishedCount = works.filter((work) => !work.sample).length;
  const byShow =
    show === "published" ? works.filter((work) => !work.sample) : works;
  const typeChips = filterKindsFor(byShow);
  const visible =
    type === "all" ? byShow : byShow.filter((work) => work.kind === type);
  const deck =
    show === "all" && publishedCount === 0 && works.length > 0
      ? `<p class="deck">Sample pieces only. Nothing is published yet.</p>`
      : "";

  const typeNav = `
        <nav class="filters filters-type" aria-label="Type">
          <a href="${url(workIndexHref(show, "all"))}"${type === "all" ? ' aria-current="true"' : ""}>All</a>
          ${typeChips
            .map((kind) => {
              const current = type === kind.id;
              return `<a href="${url(workIndexHref(show, kind.id))}"${current ? ' aria-current="true"' : ""}>${esc(kind.filterLabel)}</a>`;
            })
            .join("")}
        </nav>`;

  const showNav = `
        <nav class="filters filters-show" aria-label="Which pieces">
          <a href="${url(workIndexHref("published", type))}"${show === "published" ? ' aria-current="true"' : ""}>Published</a>
          <a href="${url(workIndexHref("all", type))}"${show === "all" ? ' aria-current="true"' : ""}>All pieces</a>
        </nav>`;

  let body: string;
  if (visible.length === 0) {
    if (type !== "all") {
      const empty = emptyTypeCopy(type);
      const back =
        byShow.length > 0
          ? `<p><a class="text-link" href="${url(workIndexHref(show, "all"))}">Show all types</a></p>`
          : "";
      body = `<div class="empty"><p class="empty-title">${esc(empty.title)}</p><p class="deck">${esc(empty.deck)}</p>${back}</div>`;
    } else {
      const back =
        works.some((work) => work.sample) && show === "published"
          ? `<p class="deck">Sample pieces stay on All pieces until they are removed from the work list.</p>
           <p><a class="text-link" href="${url(workIndexHref("all", type))}">Show samples</a></p>`
          : "";
      body = `<div class="empty"><p class="empty-title">No published work yet</p>${back}</div>`;
    }
  } else {
    body = workGrid(visible, "h2");
  }

  return {
    title: "Work — Studio Gulch",
    html: `
      <div class="wrap page" data-page="work">
        <header class="page-head">
          <h1>Work</h1>
          ${deck}
        </header>
        ${typeNav}
        ${showNav}
        ${body}
      </div>
    `,
  };
}

function metaLine(work: Work): string {
  const bits = [esc(kindLabel(work.kind))];
  if (work.year) {
    bits.push(`<time datetime="${esc(work.year)}">${esc(work.year)}</time>`);
  }
  if (work.sample) bits.push("Sample");
  return `<p class="kind">${bits.join(" · ")}</p>`;
}

function watchEntries(work: Work): Array<{ label: string; href: string }> {
  if (work.links && work.links.length > 0) return work.links;
  if (work.href) {
    return [{ href: work.href, label: work.hrefLabel ?? "Watch on X" }];
  }
  return [];
}

function watchLinks(work: Work): string {
  const entries = watchEntries(work);
  if (entries.length === 0) return "";
  return `<ul class="watch">${entries
    .map((link) => `<li>${external(link.href, link.label)}</li>`)
    .join("")}</ul>`;
}

export function workDetailPage(work: Work): { title: string; html: string } {
  return {
    title: `${work.title} — Studio Gulch`,
    html: `
      <article class="wrap page detail" data-page="work-detail">
        <p class="back"><a href="${url("/work")}">Work</a></p>
        ${frameBox(work, "frame-lg")}
        ${metaLine(work)}
        <h1>${esc(work.title)}</h1>
        ${watchLinks(work)}
        <div class="prose">${paragraphs(work.description)}</div>
        ${creditsBlock(work, "open")}
      </article>
    `,
  };
}

export function personPage(person: Person): { title: string; html: string } {
  const rows = creditsForPerson(person.id);
  const links =
    person.links && person.links.length > 0
      ? `<ul class="person-links">${person.links
          .map((link) => `<li>${external(link.href, link.label)}</li>`)
          .join("")}</ul>`
      : "";
  const list =
    rows.length === 0
      ? `<p class="deck">No Studio Gulch pieces credit this person yet.</p>`
      : `<ul class="assoc">${rows
          .map(({ work, credit }) => {
            const meta = [esc(kindLabel(work.kind))];
            if (work.sample) meta.push("Sample");
            const note = credit.note
              ? `<span class="assoc-note">${esc(credit.note)}</span>`
              : "";
            return `
              <li>
                <a class="assoc-title" href="${url(`/work/${work.slug}`)}">${esc(work.title)}</a>
                <span class="assoc-role">${esc(credit.role)}</span>
                <span class="assoc-meta">${meta.join(" · ")}</span>
                ${note}
              </li>
            `;
          })
          .join("")}</ul>`;

  return {
    title: `${person.name} — Studio Gulch`,
    html: `
      <article class="wrap page profile" data-page="person">
        <p class="back"><a href="${url("/studio")}">Studio</a></p>
        <header class="page-head">
          <h1>${esc(person.name)}</h1>
          ${person.studioRole ? `<p class="studio-role">${esc(person.studioRole)}</p>` : ""}
        </header>
        ${person.summary ? `<div class="prose">${paragraphs(person.summary)}</div>` : ""}
        ${links}
        <section class="profile-work">
          <h2 class="section-label">Work</h2>
          ${list}
        </section>
      </article>
    `,
  };
}

function personListItem(person: Person): string {
  const role = person.studioRole
    ? `<span>${esc(person.studioRole)}</span>`
    : "";
  const name = person.slug
    ? `<a href="${url(`/people/${person.slug}`)}">${esc(person.name)}</a>`
    : esc(person.name);
  return `<li>${name}${role}</li>`;
}

export function studioPage(): { title: string; html: string } {
  const people = profilePeople();
  const socials = liveSocials();
  const peopleList =
    people.length === 0
      ? ""
      : `<ul class="people">${people.map(personListItem).join("")}</ul>`;
  const socialBlock =
    socials.length === 0
      ? ""
      : `<section class="studio-block">
          <h2 class="section-label">Social</h2>
          <ul class="people">${socialItems(socials)}</ul>
        </section>`;

  return {
    title: "Studio — Studio Gulch",
    html: `
      <div class="wrap page" data-page="studio">
        <header class="page-head">
          <h1>Studio</h1>
        </header>
        <div class="prose">
          <p>Studio Gulch is a digital media studio that creates products across a wide range of media formats. It is structured as a laboratory that builds its own tools from the best technologies available, including but not limited to AI.</p>
          <p>Studio Gulch collaborates with artists of all kinds to create high quality art and content, made with machines, cut like film.</p>
        </div>
        <section class="studio-block">
          <h2 class="section-label">People</h2>
          ${peopleList}
        </section>
        ${socialBlock}
      </div>
    `,
  };
}

const CONTACT_EMAIL = "hello@studiogulch.com";

export function workWithUsPage(): { title: string; html: string } {
  const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Brand film inquiry")}`;
  return {
    title: "Work with us — Studio Gulch",
    html: `
      <div class="wrap page" data-page="work-with-us">
        <header class="page-head">
          <h1>Work with us</h1>
          <p class="deck">Short illustrated brand films. Made with machines, cut like film.</p>
        </header>
        <div class="prose">
          <p>We make 30 to 60 second animated stories about brands, events and the people behind them. Ink, pixel and hand-drawn looks, not plastic realism. You bring the story or we find it with you.</p>
        </div>
        <section class="studio-block">
          <h2 class="section-label">Brand film package · $250</h2>
          <ul class="people">
            <li>One 30–60s illustrated film<span>Script, look, edit, music and sound</span></li>
            <li>Three social cutdowns<span>Vertical and square, ready for X, Instagram and YouTube</span></li>
            <li>One round of revisions<span>Delivered in about two weeks</span></li>
          </ul>
        </section>
        <section class="studio-block">
          <h2 class="section-label">Payment</h2>
          <div class="prose">
            <p>Bitcoin, Lightning or other crypto, or an invoice from Studio Gulch, S.A.S. de C.V. (El Salvador). Half to start, half on delivery.</p>
          </div>
        </section>
        <section class="studio-block">
          <h2 class="section-label">Start</h2>
          <div class="prose">
            <p>Tell us who you are and what you want people to feel. We reply within two working days.</p>
          </div>
          <p><a class="text-link" href="${esc(mail)}">${esc(CONTACT_EMAIL)}</a></p>
          <p><a class="text-link" href="${url("/work")}">See the work</a></p>
        </section>
      </div>
    `,
  };
}

export function notFoundPage(): { title: string; html: string } {
  return {
    title: "Not found — Studio Gulch",
    html: `
      <div class="wrap page" data-page="not-found">
        <header class="page-head">
          <h1>Not on this site</h1>
          <p class="deck">That address does not match a page.</p>
        </header>
        <p><a class="text-link" href="${url("/")}">Back to Studio Gulch</a></p>
      </div>
    `,
  };
}
