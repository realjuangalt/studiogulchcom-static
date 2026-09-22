import type { Social } from "./types.ts";

/**
 * Studio accounts. Leave `href` null to keep an account out of the page
 * until it is live — YouTube and Rumble are reserved that way.
 */
export const studioSocials: Social[] = [
  {
    id: "x",
    label: "X",
    href: "https://x.com/studiogulch",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/gulch.studio",
    handle: "gulch.studio",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: null,
  },
  {
    id: "rumble",
    label: "Rumble",
    href: null,
  },
];

export function liveSocials(): Array<Social & { href: string }> {
  return studioSocials.filter((social): social is Social & { href: string } =>
    Boolean(social.href),
  );
}
