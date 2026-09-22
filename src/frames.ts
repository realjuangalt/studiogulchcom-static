/** Line frames for pieces that do not have a still yet. Not the studio logo. */

const marker = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <rect width="320" height="180" fill="#000"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="28,108 74,100 122,106 178,92 236,100 292,90"/>
  <line x1="28" y1="136" x2="292" y2="126" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="214" y1="130" x2="214" y2="74" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="204" y1="82" x2="224" y2="82" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="206" y1="92" x2="222" y2="92" stroke="#f3f3f1" stroke-width="1"/>
  <line x1="208" y1="102" x2="220" y2="102" stroke="#f3f3f1" stroke-width="1"/>
</svg>`;

const switchback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <rect width="320" height="180" fill="#000"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="22,48 98,78 48,116 112,158"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="298,40 210,76 270,118 188,160"/>
  <polyline fill="none" stroke="#f3f3f1" stroke-width="1" points="164,156 190,122 146,104 178,74 150,48"/>
</svg>`;

const frames: Record<string, string> = {
  marker,
  switchback,
};

export function frameMarkup(id: string | undefined): string {
  if (id && frames[id]) return frames[id];
  return marker;
}
