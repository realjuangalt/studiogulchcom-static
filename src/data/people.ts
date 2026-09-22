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
    studioRole: "Founder",
    summary:
      "Juan Galt founded Studio Gulch. He directed a documentary he made, and he appeared in another documentary on HBO.",
  },
  {
    id: "elli-satoshi",
    slug: "elli-satoshi",
    name: "Elli Satoshi",
    studioRole: "Collaborator",
    summary: "Elli Satoshi collaborates with Studio Gulch.",
    links: [{ label: "X", href: "https://x.com/ellitoshi21" }],
  },
];

export function personById(id: string): Person | undefined {
  return people.find((person) => person.id === id);
}

export function personBySlug(slug: string): Person | undefined {
  return people.find((person) => person.slug === slug);
}

export function profilePeople(): Person[] {
  return people.filter((person) => person.slug);
}
