/** Line frames for pieces that do not have a still yet. Not the studio logo.
 * Drawn for a 1:1 stage — Studio Gulch catalogue media is square by default.
 */

const marker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <rect width="320" height="320" fill="#000"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="28,188 74,180 122,186 178,172 236,180 292,170"/>
  <line x1="28" y1="216" x2="292" y2="206" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="214" y1="210" x2="214" y2="154" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="204" y1="162" x2="224" y2="162" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="206" y1="172" x2="222" y2="172" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="208" y1="182" x2="220" y2="182" stroke="#f3f3f1" stroke-width="1"/>
</svg>`;

const switchback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <rect width="320" height="320" fill="#000"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="22,88 98,118 48,156 112,198"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="298,80 210,116 270,158 188,200"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="164,236 190,202 146,184 178,154 150,128"/>
</svg>`;

const frames: Record<string, string> = {
  marker,
  switchback,
};

export function frameMarkup(id: string | undefined): string {
  if (id && frames[id]) return frames[id];
  return marker;
}
