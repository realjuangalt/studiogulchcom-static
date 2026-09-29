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

function pickDirectionIndex(): number {
  return Math.floor(Math.random() * 4);
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
      <button type="button" class="reveal-sound" aria-pressed="false" aria-label="Play again with sound">
        Sound
      </button>
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

  const index = pickDirectionIndex();
  if (index === GULCH_INDEX) {
    window.THREE = await import("three");
  }

  mountPoint.innerHTML = stageMarkup();
  const { createRevealEngine } = await import("./engine.js");
  const root = mountPoint.querySelector<HTMLElement>(".reveal-shell");
  if (!root) return;

  const engine = createRevealEngine(root) as RevealApi;
  const soundBtn = root.querySelector<HTMLButtonElement>(".reveal-sound");
  let disposed = false;

  const applyFormat = () => {
    engine.setFormat(formatForViewport());
  };

  applyFormat();
  engine.setSound(false);

  const run = async (withSound: boolean) => {
    if (disposed) return;
    engine.setSound(withSound);
    if (soundBtn) {
      soundBtn.setAttribute("aria-pressed", withSound ? "true" : "false");
      soundBtn.textContent = withSound ? "Sound on" : "Sound";
    }
    await engine.play(index);
  };

  await engine.artReady.catch(() => undefined);
  if (disposed) return;
  host.classList.add("is-live");
  await run(false);

  const onSound = () => {
    void run(true);
  };
  soundBtn?.addEventListener("click", onSound);

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
