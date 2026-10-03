import { useEffect, useRef } from 'react';

/** A deterministic particle field: scattered intentions converge into the brand's pixel ring. */
export function ContextSculpture({ paused }: { readonly paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const points = [
      [3, 1],
      [4, 1],
      [5, 1],
      [2, 2],
      [6, 2],
      [2, 3],
      [4, 3],
      [6, 3],
      [2, 4],
      [6, 4],
      [3, 5],
      [4, 5],
      [5, 5],
    ] as const;
    const particles = points.flatMap(([x, y], group) =>
      Array.from({ length: 16 }, (_, i) => ({
        x: (x - 4) * 62 + (i % 4) * 12,
        y: (y - 3) * 62 + Math.floor(i / 4) * 12,
        seed: group * 16 + i,
      })),
    );
    let width = 0,
      height = 0,
      frame = 0,
      visible = true,
      time = 0,
      last = 0;
    const pointer = { x: 0, y: 0 };
    let scrollProgress = 0;
    const trackScroll = () => {
      scrollProgress = Math.min(
        1,
        Math.max(0, window.scrollY / Math.max(height * 0.8, 1)),
      );
    };
    const draw = (stamp: number) => {
      if (!visible) {
        last = 0;
        return;
      }
      const still = paused || media.matches;
      if (!still && last) time += Math.min(stamp - last, 40);
      last = stamp;
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width / 540, height / 470);
      const phase = still ? 1 : (Math.sin(time / 3400 - 0.9) + 1) / 2;
      const assemble = still
        ? 1
        : Math.min(1, 0.58 + phase * 0.22 + scrollProgress * 0.42);
      ctx.save();
      ctx.translate(width / 2 + pointer.x * 9, height / 2 + pointer.y * 9);
      ctx.scale(scale, scale);
      for (const p of particles) {
        const angle = p.seed * 2.39996;
        const spread = (1 - assemble) * 180;
        const x = p.x - 18 + Math.cos(angle) * spread;
        const y = p.y - 18 + Math.sin(angle) * spread;
        ctx.fillStyle =
          p.seed % 11 === 0
            ? '#e3fa83'
            : `rgba(236,241,255,${0.55 + (p.seed % 5) * 0.1})`;
        ctx.fillRect(x, y, 9, 9);
      }
      for (let i = 0; i < 24; i++) {
        const angle = i * 2.39996 + time / 28000;
        const radius = 220 + Math.sin(i * 3) * 38;
        ctx.fillStyle = `rgba(236,241,255,${0.15 + (i % 3) * 0.1})`;
        ctx.fillRect(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.72,
          i % 3 === 0 ? 7 : 3,
          i % 3 === 0 ? 7 : 3,
        );
      }
      ctx.restore();
      if (!still) frame = requestAnimationFrame(draw);
    };
    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return;
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      trackScroll();
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(draw);
    });
    const move = (event: PointerEvent) => {
      if (media.matches || paused) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointer.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    };
    const preference = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    resize.observe(canvas);
    visibility.observe(canvas);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('scroll', trackScroll, { passive: true });
    media.addEventListener('change', preference);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      canvas.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', trackScroll);
      media.removeEventListener('change', preference);
    };
  }, [paused]);
  return <canvas ref={ref} className='landing-sculpture' aria-hidden='true' />;
}
