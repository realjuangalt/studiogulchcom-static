import type { Credit, Work } from "./types.ts";

/**
 * Pieces in featured order. The home page shows the first three.
 *
 * Add a real piece by copying an entry, setting `sample` to false, and
 * pointing each credit at an `id` from people.ts. Delete the sample entries
 * when they are no longer needed.
 */
export const works: Work[] = [
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
