type GlitchMode =
  | 'seam'
  | 'split'
  | 'scatter'
  | 'dropout'
  | 'scan'
  | 'echo'
  | 'zipper'
  | 'rain';

type Pulse = readonly [start: number, duration: number, strength: number];

type GlitchEvent = {
  mode: GlitchMode;
  start: number;
  duration: number;
  pulses: Pulse[];
  letter: number;
  seed: number;
  sign: number;
  bandY: number;
  half: number;
  full: boolean;
};

type GlitchFrame = GlitchEvent & {
  pulseIndex: number;
  pulseAge: number;
  progress: number;
  power: number;
  decay: number;
  alive: boolean;
};

type WordPoint = { x: number; y: number; letter: number; seed: number };
type WordShape = {
  points: WordPoint[];
  centers: number[];
  width: number;
  height: number;
};

type Tile = {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  width: number;
  height: number;
  depth: number;
  tone: number;
  bits: number;
};

type TileChange = { id: number; from: Tile; to: Tile; delay: number };
type Transition = { start: number; duration: number; changes: TileChange[] };

const PULSES: Record<GlitchMode, readonly Pulse[]> = {
  seam: [
    [0.05, 0.19, 1.13],
    [0.33, 0.1, 0.56],
  ],
  split: [[0.05, 0.27, 1.14]],
  scatter: [
    [0.04, 0.12, 0.91],
    [0.21, 0.13, 1.18],
    [0.44, 0.1, 0.76],
  ],
  dropout: [
    [0.035, 0.09, 1.08],
    [0.17, 0.08, 0.88],
    [0.31, 0.12, 1.12],
  ],
  scan: [
    [0.045, 0.2, 1.05],
    [0.34, 0.13, 0.78],
  ],
  echo: [
    [0.055, 0.24, 0.96],
    [0.35, 0.17, 0.74],
  ],
  zipper: [
    [0.04, 0.12, 0.97],
    [0.22, 0.14, 1.11],
    [0.43, 0.11, 0.86],
  ],
  rain: [
    [0.055, 0.19, 1.06],
    [0.37, 0.13, 0.82],
  ],
};

const MODES = Object.keys(PULSES) as GlitchMode[];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, progress: number) => a + (b - a) * progress;
const easeOut = (progress: number) => 1 - (1 - clamp(progress)) ** 4;
const bell = (distance: number, width: number) =>
  Math.exp(-(distance * distance) / (width * width));
const hash = (value: number) => {
  const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return result - Math.floor(result);
};

function sampleWord(word: string): WordShape {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 180;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return { points: [], centers: [], width: 1, height: 1 };

  context.font = '600 110px "Geist Variable", sans-serif';
  context.fillStyle = '#fff';
  context.fillText(word, 20, 128);
  const edges = Array.from(
    { length: word.length + 1 },
    (_, index) => context.measureText(word.slice(0, index)).width,
  );
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const raw: { x: number; y: number; letter: number }[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let y = 12; y < 160; y += 4) {
    for (let x = 16; x < Math.min(canvas.width, edges.at(-1)! + 28); x += 4) {
      if ((pixels[(y * canvas.width + x) * 4 + 3] ?? 0) < 120) continue;
      let letter = 0;
      while (
        letter < word.length - 1 &&
        x - 20 >= (edges[letter + 1] ?? Infinity)
      )
        letter++;
      raw.push({ x, y, letter });
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (!raw.length) return { points: [], centers: [], width: 1, height: 1 };
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    points: raw.map((point, index) => ({
      x: point.x - centerX,
      y: point.y - centerY,
      letter: point.letter,
      seed: hash(index * 0.61803398875),
    })),
    centers: edges
      .slice(0, -1)
      .map(
        (edge, index) => 20 + (edge + (edges[index + 1] ?? edge)) / 2 - centerX,
      ),
    width: maxX - minX || 1,
    height: maxY - minY || 1,
  };
}

function makeTiles(): Tile[] {
  return Array.from({ length: 8 * 12 }, (_, id) => {
    const column = id % 8;
    const row = Math.floor(id / 8);
    const depth = hash(id + 17);
    const x = -0.13 + column * 0.17 + (hash(id + 11) - 0.5) * 0.08;
    const y = -0.14 + row * 0.12 + (hash(id + 29) - 0.5) * 0.06;
    return {
      id,
      x,
      y,
      baseX: x,
      baseY: y,
      width: 0.055 + hash(id + 55) * 0.12,
      height: 0.018 + hash(id + 19) * 0.065,
      depth,
      tone: 0.048 + depth * 0.026,
      bits: Math.floor(hash(id + 712) * 511),
    };
  });
}

function stroke(context: CanvasRenderingContext2D, alpha: number) {
  context.strokeStyle = `rgba(198, 207, 222, ${Math.min(0.92, alpha)})`;
}

function fill(context: CanvasRenderingContext2D, alpha: number) {
  context.fillStyle = `rgba(198, 207, 222, ${Math.min(0.92, alpha)})`;
}

function dot(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
) {
  fill(context, alpha);
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function line(
  context: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  alpha: number,
) {
  stroke(context, alpha);
  context.lineWidth = 0.7;
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
}

function drawTile(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  tilt: number,
  alpha: number,
  depth: number,
) {
  context.beginPath();
  context.moveTo(x, y + tilt);
  context.lineTo(x + width, y - tilt);
  context.lineTo(x + width, y + height - tilt);
  context.lineTo(x, y + height + tilt);
  context.closePath();
  fill(context, 0.006 + depth * 0.01);
  context.fill();
  stroke(context, alpha);
  context.lineWidth = 0.65;
  context.stroke();
}

function sizeCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * scale);
  const pixelHeight = Math.round(height * scale);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);
  return context;
}

function frameOf(event: GlitchEvent | null, time: number): GlitchFrame | null {
  if (!event) return null;
  const age = time - event.start;
  let pulseIndex = -1;
  event.pulses.forEach(([start], index) => {
    if (age >= start) pulseIndex = index;
  });

  let pulseAge = -1;
  let progress = 0;
  let power = 0;
  let decay = 0;
  let alive = false;
  if (pulseIndex >= 0) {
    const [start, duration, strength] = event.pulses[pulseIndex]!;
    pulseAge = age - start;
    progress = clamp(pulseAge / duration);
    alive = pulseAge < duration + 0.4;
    if (pulseAge < duration) {
      const attack = progress < 0.07 ? easeOut(progress / 0.07) : 1;
      const envelope =
        event.mode === 'echo'
          ? Math.sin(Math.PI * progress) ** 0.7
          : event.mode === 'scan'
            ? Math.sin(Math.PI * progress) ** 0.48
            : progress < 0.46
              ? 1
              : progress < 0.57
                ? 0.42
                : progress < 0.73
                  ? 0.8
                  : 0.8 * ((1 - progress) / 0.27) ** 2;
      power = attack * envelope * strength;
    }
    decay = alive ? (1 - clamp(pulseAge / (duration + 0.4))) ** 1.15 : 0;
  }
  return {
    ...event,
    pulseIndex,
    pulseAge,
    progress,
    power,
    decay,
    alive,
    sign: event.sign * (pulseIndex % 2 === 1 ? -1 : 1),
    bandY:
      event.bandY +
      (pulseIndex < 0
        ? 0
        : (pulseIndex - (event.pulses.length - 1) / 2) * event.half * 0.42),
  };
}

export function mountAuthMosaic(options: {
  panel: HTMLElement;
  fieldCanvas: HTMLCanvasElement;
  wordCanvas: HTMLCanvasElement;
  wordRegion: HTMLElement;
  word: string;
}) {
  const { panel, fieldCanvas, wordCanvas, wordRegion, word } = options;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let shape = sampleWord(word);
  let tiles = makeTiles();
  let transition: Transition | null = null;
  let event: GlitchEvent | null = null;
  let previousMode: GlitchMode | null = null;
  let previousLetter = -1;
  let modeBag: GlitchMode[] = [];
  let lastPulse = '';
  let time = 0;
  let nextAt = 0.85;
  let visible = true;
  let disposed = false;
  let raf = 0;
  let lastFrame = 0;
  let lastPaint = 0;
  const pointer = {
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    level: 0,
    target: 0,
  };

  function chooseMode(): GlitchMode {
    if (!modeBag.length) {
      modeBag = [...MODES];
      for (let index = modeBag.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [modeBag[index], modeBag[other]] = [modeBag[other]!, modeBag[index]!];
      }
      if (modeBag.at(-1) === previousMode) {
        [modeBag[0], modeBag[modeBag.length - 1]] = [
          modeBag[modeBag.length - 1]!,
          modeBag[0]!,
        ];
      }
    }
    return modeBag.pop()!;
  }

  function startEvent() {
    const mode = chooseMode();
    const tempo = 0.87 + Math.random() * 0.23;
    const pulses = PULSES[mode].map(([start, duration, strength]): Pulse => [
      start * tempo,
      duration * (0.91 + Math.random() * 0.18),
      strength * (0.92 + Math.random() * 0.16),
    ]);
    let letter = Math.floor(Math.random() * word.length);
    if (letter === previousLetter && word.length > 1) {
      letter =
        (letter + 1 + Math.floor(Math.random() * (word.length - 1))) %
        word.length;
    }
    const [lastStart, lastDuration] = pulses.at(-1)!;
    const duration = lastStart + lastDuration + 0.09;
    event = {
      mode,
      start: time,
      duration,
      pulses,
      letter,
      seed: Math.floor(Math.random() * 1_000_000),
      sign: Math.random() > 0.5 ? 1 : -1,
      bandY: (Math.random() - 0.5) * shape.height * 0.36,
      half: shape.height * (0.24 + Math.random() * 0.11),
      full: Math.random() < 0.17,
    };
    previousMode = mode;
    previousLetter = letter;
    nextAt = time + duration + 2.05 + Math.random() * 1.35;
    panel.dataset.glitch = mode;
  }

  function commitTransition() {
    if (!transition) return;
    for (const change of transition.changes) tiles[change.id] = change.to;
    transition = null;
  }

  function beginTransition(
    glitch: GlitchFrame,
    originX: number,
    originY: number,
    width: number,
    height: number,
  ) {
    commitTransition();
    const closest = tiles
      .map(tile => ({
        id: tile.id,
        distance: Math.hypot(
          tile.x + tile.width * 0.5 - originX / width,
          (tile.y + tile.height * 0.5 - originY / height) * 1.2,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 9);
    const changes = closest.map(({ id }, index): TileChange => {
      const from = tiles[id]!;
      const amount =
        0.028 *
        (glitch.mode === 'echo'
          ? 0.72
          : glitch.mode === 'scatter'
            ? 1.34
            : 1.12);
      const vertical = glitch.mode === 'rain' || glitch.mode === 'scan';
      const to: Tile = {
        ...from,
        x: mix(
          from.baseX - 0.07,
          from.baseX + 0.07,
          clamp(
            (from.x +
              glitch.sign * amount * (vertical ? 0.38 : 0.8) +
              (Math.random() - 0.5) * 0.018 -
              from.baseX +
              0.07) /
              0.14,
          ),
        ),
        y: mix(
          from.baseY - 0.055,
          from.baseY + 0.055,
          clamp(
            (from.y +
              (vertical ? glitch.sign * amount * 0.7 : 0) +
              (Math.random() - 0.5) * 0.052 -
              from.baseY +
              0.055) /
              0.11,
          ),
        ),
        width:
          glitch.mode === 'scatter' ? 0.07 + Math.random() * 0.11 : from.width,
        height:
          glitch.mode === 'scatter'
            ? 0.024 + Math.random() * 0.045
            : from.height,
        depth: Math.random(),
        tone:
          glitch.mode === 'dropout' && index % 3 === 0
            ? 0.035
            : 0.074 + Math.random() * 0.06,
        bits: Math.floor(Math.random() * 511),
      };
      return { id, from, to, delay: index * 0.015 };
    });
    transition = {
      start: time,
      duration: glitch.mode === 'echo' ? 0.39 : 0.27,
      changes,
    };
    lastPulse = `${glitch.start}:${glitch.pulseIndex}`;
  }

  function currentTiles(): Tile[] {
    if (!transition) return tiles;
    const changes = new Map(
      transition.changes.map(change => [change.id, change]),
    );
    return tiles.map(tile => {
      const change = changes.get(tile.id);
      if (!change || !transition) return tile;
      const progress = easeOut(
        (time - transition.start - change.delay) /
          (transition.duration - change.delay),
      );
      return {
        ...change.to,
        x: mix(change.from.x, change.to.x, progress),
        y: mix(change.from.y, change.to.y, progress),
        width: mix(change.from.width, change.to.width, progress),
        height: mix(change.from.height, change.to.height, progress),
        depth: mix(change.from.depth, change.to.depth, progress),
        tone: mix(change.from.tone, change.to.tone, progress),
      };
    });
  }

  function hoverAt(x: number, y: number, width: number, height: number) {
    if (pointer.level < 0.001 || reducedMotion.matches)
      return { amount: 0, dx: 0, dy: 0 };
    const dx = x - pointer.x * width;
    const dy = y - pointer.y * height;
    const distance = Math.hypot(dx, dy) || 1;
    return {
      amount: bell(distance, Math.max(65, width * 0.22)) * pointer.level,
      dx: dx / distance,
      dy: dy / distance,
    };
  }

  function fieldHit(
    glitch: GlitchFrame | null,
    x: number,
    y: number,
    originX: number,
    originY: number,
    width: number,
    height: number,
  ) {
    if (!glitch?.alive || reducedMotion.matches) return 0;
    if (glitch.mode === 'scan') {
      return (
        bell(
          y - (originY + (glitch.pulseAge - 0.03) * height * 0.65),
          height * 0.13,
        ) * glitch.decay
      );
    }
    if (glitch.mode === 'zipper') {
      return (
        bell(
          x - (originX + (glitch.pulseAge - 0.03) * width * 0.72),
          width * 0.13,
        ) * glitch.decay
      );
    }
    const distance = Math.hypot(x - originX, y - originY);
    return (
      bell(
        distance -
          glitch.pulseAge * width * (glitch.mode === 'echo' ? 0.67 : 0.46),
        width * (glitch.mode === 'scatter' ? 0.23 : 0.18),
      ) * glitch.decay
    );
  }

  function draw() {
    const width = panel.clientWidth;
    const height = panel.clientHeight;
    const wordWidth = wordRegion.clientWidth;
    const wordHeight = wordRegion.clientHeight;
    if (!width || !height || !wordWidth || !wordHeight) return;
    const field = sizeCanvas(fieldCanvas, width, height);
    const letters = sizeCanvas(wordCanvas, wordWidth, wordHeight);
    if (!field || !letters) return;

    const scale = Math.min(
      (wordWidth * 0.84) / shape.width,
      (wordHeight * 0.4) / shape.height,
    );
    const centerX = wordWidth * 0.5;
    const centerY = wordHeight * 0.51;
    const glitch = reducedMotion.matches ? null : frameOf(event, time);
    const originX =
      wordRegion.offsetLeft +
      centerX +
      (shape.centers[glitch?.letter ?? 0] ?? 0) * scale;
    const originY =
      wordRegion.offsetTop + centerY + (glitch?.bandY ?? 0) * scale;

    if (
      glitch?.alive &&
      glitch.pulseIndex >= 0 &&
      lastPulse !== `${glitch.start}:${glitch.pulseIndex}`
    ) {
      beginTransition(glitch, originX, originY, width, height);
    }
    if (transition && time >= transition.start + transition.duration)
      commitTransition();

    const unit = Math.max(0.6, width / 500);
    for (const tile of [...currentTiles()].sort((a, b) => a.depth - b.depth)) {
      const tileWidth = tile.width * width;
      const tileHeight = tile.height * height;
      let x = tile.x * width;
      let y = tile.y * height;
      const hover = hoverAt(
        x + tileWidth * 0.5,
        y + tileHeight * 0.5,
        width,
        height,
      ).amount;
      x += (tile.depth - 0.5) * hover * 20 * unit;
      y -= hover * (4 + tile.depth * 11) * unit;
      const hit = fieldHit(
        glitch,
        x + tileWidth * 0.5,
        y + tileHeight * 0.5,
        originX,
        originY,
        width,
        height,
      );
      if (glitch?.mode === 'seam' || glitch?.mode === 'split') {
        x += glitch.sign * hit * (tile.id % 2 ? 13 : -9) * unit;
      } else if (glitch?.mode === 'scatter') {
        x += (hash(glitch.seed + tile.id) - 0.5) * hit * 25 * unit;
        y += (hash(glitch.seed + tile.id + 97) - 0.5) * hit * 18 * unit;
      } else if (glitch?.mode === 'rain') {
        y += hit * (((tile.id % 8) % 3) + 1) * 6 * unit;
      } else if (glitch?.mode === 'zipper') {
        x += glitch.sign * hit * (tile.id % 2 ? 10 : -7) * unit;
      } else if (glitch?.mode === 'scan') {
        y -= hit * 8 * unit;
      }
      let alpha = tile.tone + hover * 0.13 + hit * 0.21;
      if (glitch?.mode === 'dropout' && hit > 0.18 && tile.id % 3 === 0)
        alpha *= 0.36;
      drawTile(
        field,
        x,
        y,
        tileWidth,
        tileHeight,
        hover * 5 * unit * (tile.depth - 0.3) +
          hit * (glitch?.sign ?? 1) * 3 * unit,
        alpha,
        tile.depth,
      );
      if (tile.id % 3 === 0) {
        fill(field, alpha * 0.3);
        field.fillRect(
          x + tileWidth * 0.14,
          y + tileHeight * 0.16,
          tileWidth * 0.17,
          Math.max(1, tileHeight * 0.23),
        );
      }
      if (tile.id % 2 === 0) {
        for (let bit = 0; bit < 9; bit++) {
          if (!(tile.bits & (1 << bit))) continue;
          fill(field, alpha * 0.53 + hit * 0.1);
          field.fillRect(
            x + tileWidth * 0.46 + (bit % 3) * 2.2 * unit,
            y + tileHeight * 0.46 + Math.floor(bit / 3) * 2.2 * unit,
            1.2,
            1.2,
          );
        }
      }
    }
    if (glitch?.alive && transition) {
      for (const change of transition.changes.slice(0, 5)) {
        const x = (change.to.x + change.to.width * 0.5) * width;
        const y = (change.to.y + change.to.height * 0.5) * height;
        line(
          field,
          [
            [originX, originY],
            [mix(originX, x, 0.5), originY],
            [x, y],
          ],
          glitch.decay * 0.17,
        );
      }
    }

    const radius = Math.max(0.46, Math.min(0.85, scale * 0.73));
    for (const point of shape.points) {
      const x = centerX + point.x * scale;
      const y = centerY + point.y * scale;
      const hover = hoverAt(
        x + wordRegion.offsetLeft,
        y + wordRegion.offsetTop,
        width,
        height,
      ).amount;
      const selected =
        glitch &&
        point.letter === glitch.letter &&
        (glitch.full ||
          glitch.mode === 'scan' ||
          glitch.mode === 'rain' ||
          Math.abs(point.y - glitch.bandY) <= glitch.half);
      let power = selected ? glitch.power : 0;
      let dx = 0;
      let dy = 0;
      let ghostX = 0;
      let ghostY = 0;
      let ghost = 0;
      let skip = false;
      const row = Math.abs(Math.floor(point.y / 7)) % 4;
      const column = Math.abs(Math.floor(point.x / 7)) % 4;
      const sign = glitch?.sign ?? 1;
      if (glitch?.mode === 'seam') {
        dx = power * sign * (row % 2 ? 16 : -10) * unit;
        dy = power * (row === 1 ? 4 : -2) * unit;
        ghostX = -dx * 0.57;
        ghost = power * 0.38;
      } else if (glitch?.mode === 'split') {
        const side = point.y > glitch.bandY ? 1 : -1;
        dx = power * sign * side * 16 * unit;
        dy = -power * side * 4 * unit;
        ghostX = -dx * 0.64;
        ghostY = -dy * 0.3;
        ghost = power * 0.36;
      } else if (glitch?.mode === 'scatter') {
        const noise = hash(
          glitch.seed +
            Math.floor(point.seed * 10_000) +
            glitch.pulseIndex * 37,
        );
        dx = power * (noise - 0.5) * 38 * unit;
        dy =
          power *
          (hash(glitch.seed + Math.floor(point.seed * 9900) + 191) - 0.5) *
          21 *
          unit;
        ghostX = -dx * 0.48;
        ghostY = -dy * 0.48;
        ghost = power * 0.35;
      } else if (glitch?.mode === 'dropout') {
        dx = power * sign * (row % 2 ? 11 : -6) * unit;
        dy = power * (column % 2 ? 3 : -2) * unit;
        skip =
          power > 0.34 &&
          (Math.floor(point.x / 5) +
            Math.floor(point.y / 5) +
            glitch.seed +
            glitch.pulseIndex) %
            5 <
            2;
        ghostX = -dx * 0.34;
        ghost = power * 0.19;
      } else if (glitch?.mode === 'scan') {
        const band = mix(
          -shape.height * 0.6,
          shape.height * 0.6,
          glitch.progress,
        );
        power *= bell(point.y - band, shape.height * 0.28);
        dx = power * sign * 17 * unit;
        dy = power * (row % 2 ? 3 : -3) * unit;
        ghostX = -dx * 0.62;
        ghost = power * 0.4;
      } else if (glitch?.mode === 'echo') {
        dx = power * sign * 8 * unit;
        dy = power * Math.sin(time * 12 + point.x * 0.07) * 2.5 * unit;
        ghostX = -sign * 17 * power * unit;
        ghostY = -3 * power * unit;
        ghost = power * 0.57;
      } else if (glitch?.mode === 'zipper') {
        dx = power * sign * (column % 2 ? 16 : -13) * unit;
        dy = power * (row % 2 ? 6 : -4) * unit;
        ghostX = -dx * 0.62;
        ghostY = -dy * 0.58;
        ghost = power * 0.41;
      } else if (glitch?.mode === 'rain') {
        dy = power * (column + 1) * 6 * unit;
        dx = power * sign * (row % 2 ? 5 : -4) * unit;
        ghostX = -dx * 0.58;
        ghostY = -dy * 0.6;
        ghost = power * 0.38;
      }
      dx = dx * 1.36 + hover * Math.sin(point.y * 0.07) * 2 * unit;
      dy = dy * 1.36 - hover * 2.1 * unit;
      ghostX *= 1.36;
      ghostY *= 1.36;
      if (ghost > 0.01) {
        dot(letters, x + dx + ghostX, y + dy + ghostY, radius, ghost);
        dot(
          letters,
          x + dx + ghostX * 2,
          y + dy + ghostY * 2,
          radius,
          ghost * 0.35,
        );
      }
      if (hover > 0.15)
        dot(
          letters,
          x + dx + 2 * unit,
          y + dy - 2 * unit,
          radius,
          hover * 0.12,
        );
      if (!skip)
        dot(
          letters,
          x + dx,
          y + dy,
          radius,
          0.65 + point.seed * 0.12 + hover * 0.14,
        );
    }
  }

  function tick(now: number) {
    raf = 0;
    if (disposed || !visible || document.hidden || reducedMotion.matches) {
      lastFrame = 0;
      return;
    }
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.08) : 0;
    lastFrame = now;
    time += delta;
    if (time >= nextAt) startEvent();
    if (event && time > event.start + event.duration + 0.55) event = null;
    const easing = 1 - Math.exp(-delta * 12);
    pointer.x = mix(pointer.x, pointer.targetX, easing);
    pointer.y = mix(pointer.y, pointer.targetY, easing);
    pointer.level = mix(pointer.level, pointer.target, easing);
    if (now - lastPaint > 32) {
      draw();
      lastPaint = now;
    }
    raf = requestAnimationFrame(tick);
  }

  function wake() {
    if (disposed || !visible || document.hidden || reducedMotion.matches)
      return;
    if (!raf) {
      lastFrame = 0;
      raf = requestAnimationFrame(tick);
    }
  }

  function onPointerMove(pointerEvent: PointerEvent) {
    if (
      pointerEvent.target instanceof Element &&
      pointerEvent.target.closest('button')
    ) {
      pointer.target = 0;
      wake();
      return;
    }
    const bounds = panel.getBoundingClientRect();
    pointer.targetX = clamp(
      (pointerEvent.clientX - bounds.left) / bounds.width,
    );
    pointer.targetY = clamp(
      (pointerEvent.clientY - bounds.top) / bounds.height,
    );
    pointer.target = 1;
    wake();
  }

  function onPointerLeave() {
    pointer.target = 0;
    wake();
  }

  function onVisibilityChange() {
    if (!document.hidden) wake();
  }

  function onReducedMotionChange() {
    if (reducedMotion.matches) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      commitTransition();
      pointer.level = 0;
      draw();
    } else wake();
  }

  panel.addEventListener('pointermove', onPointerMove);
  panel.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', onReducedMotionChange);
  const resize = new ResizeObserver(draw);
  resize.observe(panel);
  resize.observe(wordRegion);
  const visibility = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    if (visible) wake();
  });
  visibility.observe(panel);
  draw();
  wake();
  void document.fonts.ready.then(() => {
    if (disposed) return;
    shape = sampleWord(word);
    draw();
  });

  return {
    trigger() {
      if (disposed || reducedMotion.matches) return;
      commitTransition();
      startEvent();
      draw();
      wake();
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      resize.disconnect();
      visibility.disconnect();
      panel.removeEventListener('pointermove', onPointerMove);
      panel.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onReducedMotionChange);
    },
  };
}
