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

/**
 * Catalogue type ids. Extend `WORK_KINDS` in `works.ts` when a new kind ships
 * (e.g. full ads / publicity cuts). Filter chips use these ids in `?type=`.
 */
export type WorkKindId = "short-film" | "shorts" | "publicity" | "other";

export type WorkKindDef = {
  id: WorkKindId;
  /** Singular label on cards and detail meta. */
  label: string;
  /** Plural / chip label in the Work type filter. */
  filterLabel: string;
  /** Always list in the type filter, even with zero pieces. */
  alwaysShow?: boolean;
};

export type Work = {
  slug: string;
  title: string;
  /** Catalogue type — see `WORK_KINDS` / `kindLabel` in `works.ts`. */
  kind: WorkKindId;
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
  /**
   * Media frame ratio. Defaults to square (`1/1`) — Studio Gulch cuts are 1:1.
   * Set `16/9` only when a piece truly needs a wide frame.
   */
  aspect?: "1/1" | "16/9";
  /**
   * External watch / distribution links (X, Instagram, etc.).
   * Preferred over the single `href` / `hrefLabel` pair when both exist.
   */
  links?: PersonLink[];
  /** @deprecated Prefer `links`. Single external watch URL. */
  href?: string;
  /** @deprecated Prefer `links`. Label for `href`. Defaults to "Watch on X". */
  hrefLabel?: string;
  credits: Credit[];
};

export type Social = {
  id: string;
  label: string;
  /** Null until the account is live. Null links are not rendered. */
  href: string | null;
  handle?: string;
};
