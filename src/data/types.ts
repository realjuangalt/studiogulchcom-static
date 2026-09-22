export type PersonLink = {
  label: string;
  href: string;
};

/** A person who can be credited. A profile page exists only when `slug` is set. */
export type Person = {
  id: string;
  name: string;
  /** Route segment for /people/{slug}. Omit for a credit-only name. */
  slug?: string;
  /** Relationship to the studio. Not a per-piece credit. */
  studioRole?: string;
  summary?: string;
  links?: PersonLink[];
};

export type Credit = {
  personId: string;
  role: string;
  note?: string;
};

export type Work = {
  slug: string;
  title: string;
  /** Short label on the card, such as "AI ad" or "Short". */
  kind: string;
  /** One line under the title. */
  summary: string;
  /** Detail copy. Separate paragraphs with a blank line. */
  description: string;
  year?: string;
  /** Labeled in the UI and hidden by the Published filter. */
  sample: boolean;
  /** Public path, for example "/stills/mile-marker.jpg". */
  still?: string;
  /** Drawn frame used when `still` is absent. */
  frame?: "marker" | "switchback";
  credits: Credit[];
};

export type Social = {
  id: string;
  label: string;
  /** Null until the account is live. Null links are not rendered. */
  href: string | null;
  handle?: string;
};
