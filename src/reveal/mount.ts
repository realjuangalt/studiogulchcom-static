import "./reveal.css";

type RevealApi = {
  play: (index: number) => Promise<void>;
  setFormat: (fmt: "sq" | "wide") => void;
  setSound: (on: boolean) => void;
  getSound: () => boolean;
  getDirection: () => string;
  getDirections: () => string[];
  destroy: () => void;
  artReady: Promise<unknown>;
  reducedMotion: boolean;
};

const WIDE_MQ = "(min-width: 860px)";
/** Matches DIRS order in engine.js: Ink, Signal, Gulch, Cut */
const GULCH_INDEX = 2;

declare global {
  interface Window {
    THREE?: unknown;
  }
}

let active: { destroy: () => void } | null = null;

function formatForViewport(): "sq" | "wide" {
  return window.matchMedia(WIDE_MQ).matches ? "wide" : "sq";
}

function pickDirectionIndex(except?: number): number {
  if (except == null) return Math.floor(Math.random() * 4);
  let next = except;
  for (let i = 0; i < 8 && next === except; i++) {
    next = Math.floor(Math.random() * 4);
  }
  if (next === except) next = (except + 1) % 4;
  return next;
}

function stageMarkup(): string {
  return `
    <div class="reveal-shell">
      <div id="stage" class="sq" aria-label="Studio Gulch mark reveal">
        <div class="markPos">
          <div class="cam">
            <svg id="mark" role="img" aria-label="Studio Gulch mark"></svg>
          </div>
        </div>
        <canvas id="cv"></canvas>
        <div id="gl"></div>
        <div class="flare"></div>
        <div class="flash"></div>
        <div class="type">
          <h1 class="word" id="word"></h1>
          <div class="tag">Made with machines. Cut like film.</div>
        </div>
        <canvas id="grain" width="160" height="160"></canvas>
      </div>
      <div class="reveal-controls">
        <button type="button" class="reveal-ctrl reveal-next" aria-label="Try another reveal" title="Another reveal">
          <span aria-hidden="true">∞</span>
        </button>
        <button type="button" class="reveal-ctrl reveal-sound" aria-pressed="false" aria-label="Play again with sound" title="Sound">
          <svg class="icon-speaker" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 9.5h3.2L12 5v14l-5.8-4.5H3z" fill="currentColor"/>
            <path class="wave" d="M15.2 9.2a3.6 3.6 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <path class="wave wave-2" d="M17.6 7a6.2 6.2 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <path class="mute" d="M4 4l16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

export async function mountHomeReveal(host: HTMLElement): Promise<void> {
  active?.destroy();
  active = null;

  host.classList.remove("is-live");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    host.classList.add("is-static");
    return;
  }

  host.classList.remove("is-static");
  const mountPoint = host.querySelector<HTMLElement>("[data-reveal-mount]");
  if (!mountPoint) return;

  let index = pickDirectionIndex();
  if (index === GULCH_INDEX) {
    window.THREE = await import("three");
  }

  mountPoint.innerHTML = stageMarkup();
  const { createRevealEngine } = await import("./engine.js");
  const root = mountPoint.querySelector<HTMLElement>(".reveal-shell");
  if (!root) return;

  const engine = createRevealEngine(root) as RevealApi;
  const soundBtn = root.querySelector<HTMLButtonElement>(".reveal-sound");
  const nextBtn = root.querySelector<HTMLButtonElement>(".reveal-next");
  let disposed = false;
  let playing = false;

  const applyFormat = () => {
    engine.setFormat(formatForViewport());
  };

  applyFormat();
  engine.setSound(false);

  const run = async (withSound: boolean) => {
    if (disposed || playing) return;
    playing = true;
    try {
      engine.setSound(withSound);
      if (soundBtn) {
        soundBtn.setAttribute("aria-pressed", withSound ? "true" : "false");
        soundBtn.setAttribute(
          "aria-label",
          withSound ? "Sound on — play again" : "Play again with sound",
        );
      }
      await engine.play(index);
    } finally {
      playing = false;
    }
  };

  await engine.artReady.catch(() => undefined);
  if (disposed) return;
  host.classList.add("is-live");
  await run(false);

  const onSound = () => {
    void run(true);
  };
  const onNext = () => {
    void (async () => {
      if (disposed || playing) return;
      index = pickDirectionIndex(index);
      if (index === GULCH_INDEX && !window.THREE) {
        window.THREE = await import("three");
      }
      await run(engine.getSound());
    })();
  };
  soundBtn?.addEventListener("click", onSound);
  nextBtn?.addEventListener("click", onNext);

  const mq = window.matchMedia(WIDE_MQ);
  let resizeTimer = 0;
  const onFormatChange = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (disposed) return;
      applyFormat();
      void run(engine.getSound());
    }, 200);
  };
  mq.addEventListener("change", onFormatChange);

  active = {
    destroy() {
      disposed = true;
      window.clearTimeout(resizeTimer);
      soundBtn?.removeEventListener("click", onSound);
      nextBtn?.removeEventListener("click", onNext);
      mq.removeEventListener("change", onFormatChange);
      engine.destroy();
      mountPoint.innerHTML = "";
    },
  };
}

export function unmountHomeReveal(): void {
  active?.destroy();
  active = null;
}
