import type { Credit, Work } from "./types.ts";

/**
 * Pieces in featured order. Home Recent prefers published entries first
 * (up to three), then falls back to samples when nothing is published yet.
 *
 * Add a real piece with `sample: false`. Keep sample entries until they are
 * retired; they stay visible under Work → All.
 */
export const works: Work[] = [
  {
    slug: "bitcoin-toll-of-hormuz",
    title: "Not everyone is prepared to pay the Bitcoin Toll of Hormuz...",
    kind: "Short",
    summary: "A square short from Studio Gulch. Watch on X or Instagram.",
    description:
      "Studio Gulch’s second published catalogue piece. A roughly two-minute square short posted on X and Instagram: Not everyone is prepared to pay the Bitcoin Toll of Hormuz.\n\nWatch the full cut on X or Instagram. The still on this page is the piece’s Polanco design art.",
    year: "2026",
    sample: false,
    still: "/stills/bitcoin-toll-of-hormuz-polanco.jpg",
    links: [
      {
        label: "Watch on X",
        href: "https://x.com/StudioGulch/status/2105803970472247468",
      },
      {
        label: "Watch on Instagram",
        href: "https://www.instagram.com/p/Dd-DLaStCwN/",
      },
    ],
    credits: [
      { personId: "juan-galt", role: "Director" },
      { personId: "elli-satoshi", role: "Producer" },
      { personId: "duityors", role: "Editor" },
    ],
  },
  {
    slug: "bitcoin-tidal-wave",
    title: "Bitcoin is like a tidal wave...",
    kind: "Short",
    summary: "A square short from Studio Gulch. Watch on X or Instagram.",
    description:
      "Studio Gulch’s first published catalogue piece. A roughly fifty-four-second square short: Bitcoin figured as a tidal wave — force that can lift, and force that can take the ground out from under you.\n\nWatch the full cut on X or Instagram. The still on this page is from the piece’s design art.",
    year: "2026",
    sample: false,
    still: "/stills/bitcoin-tidal-wave-sq.jpg",
    links: [
      {
        label: "Watch on X",
        href: "https://x.com/StudioGulch/status/2105777341221794202",
      },
      {
        label: "Watch on Instagram",
        href: "https://www.instagram.com/p/Dd9-oZmtc1Y/",
      },
    ],
    credits: [
      { personId: "juan-galt", role: "Director" },
      { personId: "elli-satoshi", role: "Producer" },
      { personId: "duityors", role: "Editor" },
    ],
  },
  {
    slug: "mile-marker",
    title: "Mile Marker",
    kind: "AI ad",
    summary: "A sample thirty-second ad. An empty highway, no client.",
    description:
      "A sample advertisement, about thirty seconds. The picture rides a two-lane road at dusk until a mile marker holds the frame, and then the weather takes it apart.\n\nPicture and sound are generated. There is no brand behind it. The cut is here so the ad form can be checked before a real spot is added.",
    year: "2026",
    sample: true,
    frame: "marker",
    credits: [
      { personId: "juan-galt", role: "Director" },
      { personId: "elli-satoshi", role: "Picture", note: "Generated plates" },
    ],
  },
  {
    slug: "after-the-switchback",
    title: "After the Switchback",
    kind: "Short",
    summary: "A sample short. Two voices above a canyon.",
    description:
      "A sample short. Two people pull off after the last switchback, talk above a canyon, and stay until the light is gone.\n\nNo festival and no client. It stands in so a second kind of piece, with different credits, is visible on the site.",
    year: "2026",
    sample: true,
    frame: "switchback",
    credits: [
      { personId: "elli-satoshi", role: "Editor" },
      { personId: "juan-galt", role: "Writer" },
    ],
  },
];

export function workBySlug(slug: string): Work | undefined {
  return works.find((work) => work.slug === slug);
}

/** Home Recent and similar: published first, then samples if needed. */
export function featuredWorks(limit = 3): Work[] {
  const published = works.filter((work) => !work.sample);
  if (published.length > 0) return published.slice(0, limit);
  return works.slice(0, limit);
}

export function creditsForPerson(
  personId: string,
): Array<{ work: Work; credit: Credit }> {
  const rows: Array<{ work: Work; credit: Credit }> = [];
  for (const work of works) {
    for (const credit of work.credits) {
      if (credit.personId === personId) rows.push({ work, credit });
    }
  }
  return rows;
}
