# Studio Gulch

Static site for Studio Gulch, an AI media studio. The stack is Vite and TypeScript. `npm run build` writes a `dist/` folder that GitHub Pages can host with no server.

Repository: [realjuangalt/studiogulchcom-static](https://github.com/realjuangalt/studiogulchcom-static). The public site is [studiogulch.com](https://studiogulch.com).

## Run locally

```bash
npm install
npm run dev
```

The dev server binds `0.0.0.0` on port **43123**: [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Build

```bash
npm run build
npm run preview
```

`dist/` is the site. Do not point GitHub Pages at the repository root.

## GitHub Pages

Pushing `main` or `master` runs `.github/workflows/pages.yml`. That workflow builds `dist/` and deploys it with GitHub Actions. In the repository settings, Pages has to use **GitHub Actions** as the source (not the branch root — the root is the Vite project, not the built site).

The workflow sets `VITE_BASE` to `/` so assets and routes match `studiogulch.com`. Local `npm run dev` and `npm run build` use the same root base. The custom domain is saved in the repository Pages settings. This deploy does not use a `CNAME` file.

`https://realjuangalt.github.io/studiogulchcom-static/` will not load assets while the base is `/`. To publish only as a project page again, set `VITE_BASE` in the workflow to `/studiogulchcom-static/`.

Routes are real paths (`/work`, `/work/mile-marker`, `/people/juan-galt`, `/studio`). The production build copies `index.html` to `dist/404.html`. GitHub Pages serves that file when a direct visit does not match a file, and it leaves the URL in place, so the router can read the path.

## Add a piece

Edit `src/data/works.ts` and put real pieces first. `/work` defaults to **published** work across **all types**; samples stay under `/work?show=all`. Type chips use `?type=short-film`, `?type=shorts`, etc. Home Recent shows up to three published pieces (falling back to samples only when nothing is published).

| Field | What to put |
| --- | --- |
| `slug` | URL segment. `north-window` becomes `/work/north-window`. |
| `title` | Piece title. |
| `kind` | Catalogue type id: `short-film`, `shorts`, `websites`, `publicity`, or `other`. Labels and filter chips live in `WORK_KINDS` in the same file — extend that list for new kinds (e.g. full ads). |
| `summary` | One line on the card. |
| `description` | Detail page. Separate paragraphs with a blank line. |
| `sample` | `false` for real work. `true` shows a Sample label and hides the piece on the Published filter. |
| `credits` | `{ personId, role, note? }`. `personId` matches an `id` in `src/data/people.ts`. The role is for this piece only. |
| `still` | Optional. Put an image in `public/stills/` and set `"/stills/filename.jpg"`. If omitted, a drawn frame is used. |
| `frame` | Optional placeholder when there is no still: `marker` or `switchback`. |
| `links` | Optional. External watch links: `{ label, href }[]` (e.g. Watch on X, Watch on Instagram). |
| `href` / `hrefLabel` | Legacy single watch URL. Prefer `links` when a piece has more than one. |
| `year` | Optional. |

### Add shorts (when ready)

Insert two entries near the top of `works` (featured order). Do not invent content — wait for titles, stills, and links.

```ts
{
  slug: "your-short-slug",
  title: "…",
  kind: "shorts",          // required — lands under the Shorts filter
  summary: "…",
  description: "…\n\n…",
  year: "2026",
  sample: false,
  still: "/stills/your-short.jpg",  // file in public/stills/
  links: [
    { label: "Watch on X", href: "https://…" },
    { label: "Watch on Instagram", href: "https://…" },
  ],
  credits: [
    { personId: "juan-galt", role: "Director" },
    // add people in src/data/people.ts first if needed
  ],
}
```

Short films, Shorts, and Websites chips always show on `/work`, even when empty. New kinds: add a row to `WORK_KINDS` (set `alwaysShow: true` if the empty chip should stay visible).

Sample entries can remain in the file until they are retired.

To credit someone with no profile page, add `{ id, name }` to `src/data/people.ts` and leave `slug` unset. To give them a page at `/people/<slug>`, set `slug`, and optionally `studioRole`, `summary`, and `links`.

## People and socials

- People: `src/data/people.ts`
- Studio socials: `src/data/socials.ts`

Rumble is in the social list with `href: null` and is not shown. Set `href` when that account is live; the footer and the studio page pick up any entry with a URL.

## Type

The site is set in Julius Sans One (LatinoType), self-hosted from `src/fonts/`. The family has a single regular weight. The license is in `src/fonts/OFL.txt`. A system UI stack is the fallback if the file does not load.

## Home mark reveal

The home hero randomly plays one of four artist logo reveals (Ink, Signal, Gulch, Cut). It autoplays once with sound off. Corner controls: **∞** plays another reveal; the speaker icon turns audio on and replays. Mobile uses the 1:1 stage; wider viewports use 16:9. `prefers-reduced-motion` keeps the static logo. The engine lives in `src/reveal/` and loads only on the home page (Three.js only when Gulch is chosen).
