import type { Person } from "./types.ts";

/**
 * People who can appear in credits.
 * `studioRole` is how they sit in the studio. On-screen roles live on each piece.
 */
export const people: Person[] = [
  {
    id: "juan-galt",
    slug: "juan-galt",
    name: "Juan Galt",
    studioRole: "Founder & Art Director",
    summary:
      "Juan Galt founded Studio Gulch. He directed a documentary he made, and he appeared in another documentary on HBO.",
  },
  {
    id: "elli-satoshi",
    slug: "elli-satoshi",
    name: "Elli Satoshi",
    studioRole: "Producer",
    summary: "Elli Satoshi produces with Studio Gulch.",
    links: [{ label: "X", href: "https://x.com/ellitoshi21" }],
  },
  {
    id: "duityors",
    slug: "camilo-fique-morales",
    name: "Camilo Fique Morales",
    studioRole: "Editor",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/duityors/" },
    ],
  },
  {
    id: "c001z0n3",
    slug: "c001z0n3",
    name: "C001Z0N3",
    studioRole: "Artist",
    links: [{ label: "X", href: "https://x.com/C001Z0N3" }],
  },
];

/** Old people slugs → current slug (client router rewrites /people/duityors → Camilo). */
export const peopleSlugAliases: Record<string, string> = {
  duityors: "camilo-fique-morales",
};

export function personById(id: string): Person | undefined {
  return people.find((person) => person.id === id);
}

export function personBySlug(slug: string): Person | undefined {
  const canonical = peopleSlugAliases[slug] ?? slug;
  return people.find((person) => person.slug === canonical);
}

export function profilePeople(): Person[] {
  return people.filter((person) => person.slug);
}
