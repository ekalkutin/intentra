const STATIC_FAVICON = '/favicon.svg?v=2';
const FRAME_DURATION = 140;
const PIXEL_SIZE = 6;

const OUTLINE_PIXELS = [
  [24, 16],
  [32, 16],
  [40, 16],
  [48, 24],
  [48, 32],
  [48, 40],
  [40, 48],
  [32, 48],
  [24, 48],
  [16, 40],
  [16, 32],
  [16, 24],
] as const;

const TRAIL_OPACITY = [1, 0.76, 0.52, 0.32, 0.18];

function pixel([x, y]: readonly [number, number], opacity: number) {
  return [
    `<rect x="${x}" y="${y}"`,
    `width="${PIXEL_SIZE}" height="${PIXEL_SIZE}" opacity="${opacity}"/>`,
  ].join(' ');
}

function animatedFavicon(frame: number) {
  const head = frame % OUTLINE_PIXELS.length;
  const outline = OUTLINE_PIXELS.map((point, index) => {
    const distance =
      (head - index + OUTLINE_PIXELS.length) % OUTLINE_PIXELS.length;
    const opacity = TRAIL_OPACITY[distance] ?? 0.38;
    return pixel(point, opacity);
  }).join('');

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
    '<rect width="64" height="64" rx="14" fill="#191B1E"/>',
    '<g fill="#E1E4E9" shape-rendering="crispEdges">',
    outline,
    `<rect x="32" y="32" width="${PIXEL_SIZE}" height="${PIXEL_SIZE}" opacity="0.48"/>`,
    '</g></svg>',
  ].join('');
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Runs a low-frequency pixel pulse only while the current tab is visible. */
export function startFaviconAnimation() {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!favicon) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let interval: number | undefined;

  const stop = () => {
    if (interval !== undefined) {
      window.clearInterval(interval);
      interval = undefined;
    }
    favicon.href = STATIC_FAVICON;
  };
  const draw = () => {
    favicon.href = animatedFavicon(Math.floor(Date.now() / FRAME_DURATION));
  };
  const sync = () => {
    stop();
    if (document.hidden || reducedMotion.matches) return;
    draw();
    interval = window.setInterval(draw, FRAME_DURATION);
  };

  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  sync();
}
