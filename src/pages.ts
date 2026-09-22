import { frameMarkup } from "./frames.ts";
import { personById, profilePeople } from "./data/people.ts";
import { liveSocials } from "./data/socials.ts";
import { creditsForPerson, works } from "./data/works.ts";
import type { Credit, Person, Social, Work } from "./data/types.ts";
import { asset, esc, url } from "./url.ts";

export type Route =
  | { page: "home" }
  | { page: "work"; show: "all" | "published" }
  | { page: "work-detail"; slug: string }
  | { page: "person"; slug: string }
  | { page: "studio" }
  | { page: "not-found" };

export function matchRoute(pathname: string, search: string): Route {
  const params = new URLSearchParams(search);
  if (pathname === "/") return { page: "home" };
  if (pathname === "/work") {
    return {
      page: "work",
      show: params.get("show") === "published" ? "published" : "all",
    };
  }
  if (pathname === "/studio") return { page: "studio" };
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

function creditsBlock(work: Work): string {
  const id = `credits-${work.slug}`;
  const items =
    work.credits.length > 0
      ? work.credits
          .map((credit) => {
            const note = credit.note
              ? `<span class="credit-note">${esc(credit.note)}</span>`
              : "";
            return `<li><span class="credit-name">${creditName(credit)}</span><span class="credit-role">${esc(credit.role)}</span>${note}</li>`;
          })
          .join("")
      : `<li class="credit-note">No credits listed.</li>`;

  return `
    <div class="credits">
      <button type="button" class="credits-toggle" aria-expanded="false" aria-controls="${id}" data-credits-toggle>
        Credits · ${work.credits.length}
      </button>
      <ul id="${id}" class="credits-panel" hidden>
        ${items}
      </ul>
    </div>
  `;
}

function card(work: Work, heading: "h2" | "h3"): string {
  return `
    <article class="card"${work.sample ? ' data-sample="true"' : ""}>
      <a class="card-link" href="${url(`/work/${work.slug}`)}">
        <div class="frame">
          <div class="frame-art" aria-hidden="true">${visual(work)}</div>
          ${sampleBadge(work)}
        </div>
        <p class="kind">${esc(work.kind)}</p>
        <${heading}>${esc(work.title)}</${heading}>
        <p class="summary">${esc(work.summary)}</p>
      </a>
      ${creditsBlock(work)}
    </article>
  `;
}

function workGrid(list: Work[], heading: "h2" | "h3"): string {
  return `<div class="grid">${list.map((work) => card(work, heading)).join("")}</div>`;
}

export function homePage(): { title: string; html: string } {
  const featured = works.slice(0, 3);
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
    recent = `
      <section class="recent">
        <div class="section-head">
          <h2 class="section-label">Recent</h2>
          <a class="text-link" href="${url("/work")}">All work</a>
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
        <div class="home-intro">
          <div class="logo-crop">
            <img src="${asset("logo.png")}" alt="" width="1400" height="1400" />
          </div>
          <div class="home-copy">
            <h1>Studio Gulch</h1>
            <p class="studio-line">Made with machines. Cut like film.</p>
          </div>
        </div>
        ${recent}
      </div>
    `,
  };
}

export function workIndexPage(show: "all" | "published"): {
  title: string;
  html: string;
} {
  const publishedCount = works.filter((work) => !work.sample).length;
  const visible = show === "published" ? works.filter((work) => !work.sample) : works;
  const deck =
    show === "all" && publishedCount === 0 && works.length > 0
      ? `<p class="deck">Sample pieces only. Nothing is published yet.</p>`
      : "";

  let body: string;
  if (visible.length === 0) {
    const back =
      works.some((work) => work.sample) && show === "published"
        ? `<p class="deck">Sample pieces stay on All until they are removed from the work list.</p>
           <p><a class="text-link" href="${url("/work")}">Show samples</a></p>`
        : "";
    body = `<div class="empty"><p class="empty-title">No published work yet</p>${back}</div>`;
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
        <nav class="filters" aria-label="Which pieces">
          <a href="${url("/work")}"${show === "all" ? ' aria-current="true"' : ""}>All</a>
          <a href="${url("/work?show=published")}"${show === "published" ? ' aria-current="true"' : ""}>Published</a>
        </nav>
        ${body}
      </div>
    `,
  };
}

function metaLine(work: Work): string {
  const bits = [esc(work.kind)];
  if (work.year) {
    bits.push(`<time datetime="${esc(work.year)}">${esc(work.year)}</time>`);
  }
  if (work.sample) bits.push("Sample");
  return `<p class="kind">${bits.join(" · ")}</p>`;
}

export function workDetailPage(work: Work): { title: string; html: string } {
  return {
    title: `${work.title} — Studio Gulch`,
    html: `
      <article class="wrap page detail" data-page="work-detail">
        <p class="back"><a href="${url("/work")}">Work</a></p>
        <div class="frame frame-lg">
          <div class="frame-art" aria-hidden="true">${visual(work)}</div>
          ${sampleBadge(work)}
        </div>
        ${metaLine(work)}
        <h1>${esc(work.title)}</h1>
        <div class="prose">${paragraphs(work.description)}</div>
        ${creditsBlock(work)}
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
            const meta = [esc(work.kind)];
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

export function studioPage(): { title: string; html: string } {
  const people = profilePeople();
  const socials = liveSocials();
  const peopleList =
    people.length === 0
      ? ""
      : `<ul class="people">${people
          .map((person) => {
            const role = person.studioRole
              ? `<span>${esc(person.studioRole)}</span>`
              : "";
            const name = person.slug
              ? `<a href="${url(`/people/${person.slug}`)}">${esc(person.name)}</a>`
              : esc(person.name);
            return `<li>${name}${role}</li>`;
          })
          .join("")}</ul>`;
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
          <p>Made with machines. Cut like film.</p>
          <p>Studio Gulch is an AI media studio. Short films, publicity, and other cuts.</p>
          <p>The studio makes publicity for brands and work that can sit in a film competition.</p>
          <p>Juan Galt founded the studio. Elli Satoshi collaborates on the work.</p>
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
