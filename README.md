# Studio Gulch

Static site for Studio Gulch, an AI media studio. The stack is Vite and TypeScript. `npm run build` writes a `dist/` folder that GitHub Pages can host with no server.

Repository: [realjuangalt/studiogulchcom-static](https://github.com/realjuangalt/studiogulchcom-static). A custom domain (`studiogulch.com`) would be served from the site root. The GitHub project page is `https://realjuangalt.github.io/studiogulchcom-static/`.

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

The workflow sets `VITE_BASE` to `/<repository-name>/`, so assets and routes match a project page such as `https://realjuangalt.github.io/studiogulchcom-static/`. Local `npm run dev` and `npm run build` leave the base at `/`.

For `studiogulch.com` at the domain root, change that workflow env to `VITE_BASE: /` and rebuild. A `CNAME` file is not included; add `studiogulch.com` on the published site when the domain is ready.

Routes are real paths (`/work`, `/work/mile-marker`, `/people/juan-galt`, `/studio`). The production build copies `index.html` to `dist/404.html`. GitHub Pages serves that file when a direct visit does not match a file, and it leaves the URL in place, so the router can read the path.

## Add a piece

Edit `src/data/works.ts` and append an object. Order in that array is the order on the work index. The home page shows the first three.

| Field | What to put |
| --- | --- |
| `slug` | URL segment. `north-window` becomes `/work/north-window`. |
| `title` | Piece title. |
| `kind` | Short label, such as `AI ad` or `Short`. |
| `summary` | One line on the card. |
| `description` | Detail page. Separate paragraphs with a blank line. |
| `sample` | `false` for real work. `true` shows a Sample label and hides the piece on the Published filter. |
| `credits` | `{ personId, role, note? }`. `personId` matches an `id` in `src/data/people.ts`. The role is for this piece only. |
| `still` | Optional. Put an image in `public/stills/` and set `"/stills/filename.jpg"`. If omitted, a drawn frame is used. |
| `frame` | Optional placeholder when there is no still: `marker` or `switchback`. |
| `year` | Optional. |

The two entries already in the file are samples. Delete them when real work replaces them.

To credit someone with no profile page, add `{ id, name }` to `src/data/people.ts` and leave `slug` unset. To give them a page at `/people/<slug>`, set `slug`, and optionally `studioRole`, `summary`, and `links`.

## People and socials

- People: `src/data/people.ts`
- Studio socials: `src/data/socials.ts`

YouTube and Rumble are in the social list with `href: null`. They are not shown. Set `href` when those accounts are live; the footer and the studio page pick up any entry with a URL.

## Type

The site is set in Julius Sans One (LatinoType), self-hosted from `src/fonts/`. The family has a single regular weight. The license is in `src/fonts/OFL.txt`. A system UI stack is the fallback if the file does not load.
