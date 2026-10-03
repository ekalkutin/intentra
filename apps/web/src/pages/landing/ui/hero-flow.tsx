import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, MousePointer2, SquareTerminal } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { KindBadge, KnowledgeStatusBadge } from '@/entities/knowledge-item';

import { FLOW_ITEMS } from '../model/hero-flow';

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

/** Seconds between one record entering the desk and the next. */
const BEAT = 2.5;
/** Every record comes round again after the others have had their turn. */
const CYCLE = BEAT * FLOW_ITEMS.length;
/** How long one record's own turn lasts, from the quote to the agent's line fading. */
const TURN = 6.9;

interface Point {
  readonly x: number;
  readonly y: number;
}

/** A soft S-curve between two points, along whichever axis separates them more. */
function curve(from: Point, to: Point): string {
  const across = Math.abs(to.x - from.x) > Math.abs(to.y - from.y);
  const mid = across ? (from.x + to.x) / 2 : (from.y + to.y) / 2;
  return across
    ? `M${from.x} ${from.y} C${mid} ${from.y} ${mid} ${to.y} ${to.x} ${to.y}`
    : `M${from.x} ${from.y} C${from.x} ${mid} ${to.x} ${mid} ${to.x} ${to.y}`;
}

/**
 * The product in one loop: what the team says becomes a Draft, a person
 * approves it, and a coding agent receives it over MCP. Without motion it
 * rests on the last record, approved and delivered.
 */
export function HeroFlow() {
  const { t } = useTranslation();
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = stage.current;
      if (!root) return;
      const all = <T extends Element>(selector: string) =>
        Array.from(root.querySelectorAll<T>(selector));
      const tilt = root.querySelector<HTMLElement>('.landing-flow-tilt')!;
      const desk = root.querySelector<HTMLElement>('.landing-flow-desk')!;
      const cursor = root.querySelector<HTMLElement>('.landing-flow-cursor')!;
      const ring = root.querySelector<HTMLElement>('.landing-flow-ring')!;
      const voices = all<HTMLElement>('.landing-flow-voice');
      const cards = all<HTMLElement>('.landing-flow-card');
      const agents = all<HTMLElement>('.landing-flow-agent');
      const wires = {
        in: all<SVGPathElement>('[data-wire=in]'),
        out: all<SVGPathElement>('[data-wire=out]'),
      };
      const beams = {
        in: all<SVGPathElement>('[data-beam=in]'),
        out: all<SVGPathElement>('[data-beam=out]'),
      };

      /** Wires every quote to the desk and the desk to every agent, and says where they are. */
      const wire = () => {
        gsap.set(tilt, { rotationX: 0, rotationY: 0 });
        gsap.set([desk, ...cards], { clearProps: 'transform' });
        const frame = tilt.getBoundingClientRect();
        const box = (element: Element) => {
          const rect = element.getBoundingClientRect();
          return {
            left: rect.left - frame.left,
            right: rect.right - frame.left,
            top: rect.top - frame.top,
            bottom: rect.bottom - frame.top,
            x: rect.left - frame.left + rect.width / 2,
            y: rect.top - frame.top + rect.height / 2,
          };
        };
        const centre = box(desk);
        const said = voices.map(box);
        const reads = agents.map(box);
        const stacked = said[0]!.right > centre.left;
        FLOW_ITEMS.forEach((_, index) => {
          const from = said[index]!;
          const to = reads[index]!;
          const entering = stacked
            ? curve(
                { x: centre.x, y: from.bottom },
                { x: centre.x, y: centre.top },
              )
            : curve(
                { x: from.right, y: from.y },
                { x: centre.left, y: centre.y },
              );
          const leaving = stacked
            ? curve(
                { x: centre.x, y: centre.bottom },
                { x: centre.x, y: to.top },
              )
            : curve({ x: centre.right, y: centre.y }, { x: to.left, y: to.y });
          wires.in[index]!.setAttribute('d', entering);
          beams.in[index]!.setAttribute('d', entering);
          wires.out[index]!.setAttribute('d', leaving);
          beams.out[index]!.setAttribute('d', leaving);
        });
        return { centre, said, reads, stacked };
      };

      let redraw: () => void = wire;
      wire();
      void document.fonts.ready.then(() => redraw());
      let width = root.offsetWidth;
      let settle: ReturnType<typeof setTimeout> | undefined;
      const resize = new ResizeObserver(() => {
        if (root.offsetWidth === width) return;
        width = root.offsetWidth;
        clearTimeout(settle);
        settle = setTimeout(() => redraw(), 200);
      });
      resize.observe(root);

      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', context => {
        let loop: gsap.core.Timeline | undefined;

        const assemble = () => {
          loop?.scrollTrigger?.kill();
          loop?.kill();
          const { centre, said, reads, stacked } = wire();
          gsap.set(cards, { autoAlpha: 0, transformPerspective: 900 });
          gsap.set([...voices, ...agents], { '--on': 0, '--lit': 0 });
          // Stacked, one agent shows at a time: the first waits until its record arrives.
          gsap.set(agents[0]!, { '--on': 1 });
          gsap.set(
            [
              cursor,
              ring,
              ...beams.in,
              ...beams.out,
              ...all('[data-agent=line]'),
            ],
            { autoAlpha: 0 },
          );
          gsap.set(all('[data-agent=idle]'), { autoAlpha: 1 });

          loop = gsap.timeline({
            delay: 1,
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              toggleActions: 'play pause resume pause',
            },
          });
          // The desk breathes, so the centre plane reads as lifted.
          loop.to(
            desk,
            {
              y: -7,
              duration: 2.6,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            },
            0,
          );

          FLOW_ITEMS.forEach((_, index) => {
            const voice = voices[index]!;
            const card = cards[index]!;
            const agent = agents[index]!;
            const approve = card.querySelector('.landing-flow-approve');
            const draft = card.querySelector('[data-state=draft]');
            const approved = card.querySelector('[data-state=approved]');
            const idle = agent.querySelector('[data-agent=idle]');
            const line = agent.querySelector('[data-agent=line]');
            const from = said[index]!;
            const to = reads[index]!;

            const turn = gsap.timeline({
              repeat: -1,
              repeatDelay: CYCLE - TURN,
              defaults: { ease: 'expo.out' },
            });
            turn
              .set(card, { '--approved': 0, zIndex: 1 }, 0)
              // A leaving record always passes over the one coming in.
              .set(card, { zIndex: 3 }, 2.9)
              .set([draft, approve], { autoAlpha: 1 }, 0)
              .set(approved, { autoAlpha: 0 }, 0)
              // Someone says it.
              // Stacked, only one quote shows, so it waits for the previous record to leave.
              .to(
                voice,
                { '--on': 1, x: stacked ? 0 : 10, duration: 0.5 },
                stacked ? 1 : 0,
              )
              .to(
                voice,
                { '--on': 0, x: 0, duration: 0.4 },
                stacked ? 3.3 : 2.3,
              )
              // It becomes a Draft on the desk.
              .fromTo(
                beams.in[index]!,
                { drawSVG: '0% 0%', autoAlpha: 1 },
                {
                  drawSVG: '55% 100%',
                  duration: 0.9,
                  ease: 'power2.inOut',
                  immediateRender: false,
                },
                0.35,
              )
              .to(
                beams.in[index]!,
                { drawSVG: '100% 100%', duration: 0.35, ease: 'power2.out' },
                1.25,
              )
              .fromTo(
                card,
                {
                  x: (stacked ? from.x : from.right + 48) - centre.x,
                  y: (stacked ? from.bottom + 24 : from.y) - centre.y,
                  scale: 0.3,
                  rotationY: stacked ? 0 : -55,
                  rotationZ: -8,
                  autoAlpha: 0,
                },
                {
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotationY: 0,
                  rotationZ: 0,
                  autoAlpha: 1,
                  duration: stacked ? 0.8 : 1.1,
                  ease: 'power3.inOut',
                  immediateRender: false,
                },
                stacked ? 0.9 : 0.4,
              )
              // A person approves it.
              .fromTo(
                cursor,
                { x: 120, y: 70, autoAlpha: 0 },
                {
                  x: 0,
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.5,
                  immediateRender: false,
                },
                1.35,
              )
              .to(
                [approve, cursor],
                {
                  scale: 0.9,
                  duration: 0.09,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power1.inOut',
                },
                1.9,
              )
              .to(card, { '--approved': 1, duration: 0.35 }, 2.02)
              .to([draft, approve], { autoAlpha: 0, duration: 0.2 }, 2.02)
              .fromTo(
                approved,
                { autoAlpha: 0, scale: 0.7 },
                {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 0.4,
                  ease: 'back.out(2.2)',
                  immediateRender: false,
                },
                2.06,
              )
              .fromTo(
                ring,
                { scale: 0.96, autoAlpha: 0.8 },
                {
                  scale: 1.14,
                  autoAlpha: 0,
                  duration: 0.8,
                  immediateRender: false,
                },
                2.02,
              )
              .to(cursor, { autoAlpha: 0, duration: 0.2 }, 2.2)
              // An agent reads it over MCP.
              .fromTo(
                beams.out[index]!,
                { drawSVG: '0% 0%', autoAlpha: 1 },
                {
                  drawSVG: '55% 100%',
                  duration: 0.8,
                  ease: 'power2.inOut',
                  immediateRender: false,
                },
                3,
              )
              .to(
                beams.out[index]!,
                { drawSVG: '100% 100%', duration: 0.3, ease: 'power2.out' },
                3.8,
              )
              .to(
                card,
                {
                  x: to.x - centre.x,
                  y: to.y - centre.y,
                  scale: 0.28,
                  rotationY: stacked ? 0 : 55,
                  autoAlpha: 0,
                  duration: stacked ? 0.55 : 0.95,
                  ease: 'power3.in',
                },
                2.95,
              )
              .to(idle, { autoAlpha: 0, duration: 0.2 }, 3.75)
              .fromTo(
                line,
                { autoAlpha: 0, x: -10 },
                { autoAlpha: 1, x: 0, duration: 0.5, immediateRender: false },
                3.8,
              )
              .to(agent, { '--on': 1, duration: 0.3 }, 3.75)
              .fromTo(
                agent,
                { '--lit': 1 },
                {
                  '--lit': 0,
                  duration: 1.6,
                  ease: 'power2.out',
                  immediateRender: false,
                },
                3.8,
              )
              // It rests there until the record's next turn.
              .to(
                line,
                { autoAlpha: 0, duration: 0.3, ease: 'power2.in' },
                6.25,
              )
              .to(agent, { '--on': 0, duration: 0.3 }, 6.25)
              .to(idle, { autoAlpha: 1, duration: 0.4 }, TURN - 0.4);
            loop!.add(turn, index * BEAT);
          });
        };

        // Rebuilt timelines stay in this media context, so leaving it reverts them.
        redraw = () => context.add(assemble);
        redraw();

        // The scene leans a few degrees toward the pointer, each plane at its own depth.
        const fine = matchMedia('(pointer: fine) and (min-width: 761px)');
        const follow = { duration: 0.9, ease: 'power3.out' };
        const turnY = gsap.quickTo(tilt, 'rotationY', follow);
        const turnX = gsap.quickTo(tilt, 'rotationX', follow);
        const lean = (event: PointerEvent) => {
          if (!fine.matches) return;
          const bounds = root.getBoundingClientRect();
          turnY(((event.clientX - bounds.left) / bounds.width - 0.5) * 12);
          turnX((0.5 - (event.clientY - bounds.top) / bounds.height) * 9);
        };
        const rest = () => {
          turnY(0);
          turnX(0);
        };
        root.addEventListener('pointermove', lean);
        root.addEventListener('pointerleave', rest);

        return () => {
          redraw = wire;
          root.removeEventListener('pointermove', lean);
          root.removeEventListener('pointerleave', rest);
        };
      });

      return () => {
        clearTimeout(settle);
        resize.disconnect();
      };
    },
    { scope: stage },
  );

  return (
    <div
      ref={stage}
      className='landing-flow'
      role='img'
      aria-label={t('landing.hero.flow.label')}
    >
      <div className='landing-flow-tilt' aria-hidden='true'>
        <svg className='landing-flow-beams'>
          {FLOW_ITEMS.map(item => (
            <g key={item.id}>
              <path data-wire='in' />
              <path data-wire='out' />
              <path data-beam='in' />
              <path data-beam='out' />
            </g>
          ))}
        </svg>
        <ul className='landing-flow-voices'>
          {FLOW_ITEMS.map(item => (
            <li key={item.id} className='landing-flow-voice'>
              <span>{t(`landing.hero.flow.roles.${item.key}`)}</span>
              <p>{t(`landing.hero.flow.says.${item.key}`)}</p>
            </li>
          ))}
        </ul>
        <div className='landing-flow-desk'>
          <i className='landing-flow-ghost' />
          <i className='landing-flow-ghost' />
          <i className='landing-flow-ring' />
          {FLOW_ITEMS.map(item => (
            <article key={item.id} className='landing-flow-card'>
              <div className='landing-flow-card-top'>
                <code>{item.id}</code>
                <span className='landing-flow-state'>
                  <span data-state='draft'>
                    <KnowledgeStatusBadge status='draft' />
                  </span>
                  <span data-state='approved'>
                    <KnowledgeStatusBadge status='approved' />
                  </span>
                </span>
              </div>
              <p>{t(`landing.demoSection.turns.${item.key}.title`)}</p>
              <div className='landing-flow-card-foot'>
                <KindBadge kind={item.kind} />
                <span className='landing-flow-approve'>
                  <Check size={14} />
                  {t('landing.demoSection.approve')}
                </span>
              </div>
            </article>
          ))}
          <MousePointer2 className='landing-flow-cursor' size={24} />
        </div>
        <ul className='landing-flow-agents'>
          {FLOW_ITEMS.map(item => (
            <li key={item.id} className='landing-flow-agent'>
              <strong>
                <SquareTerminal size={16} />
                {t(`landing.strip.${item.agent}`)}
              </strong>
              <span className='landing-flow-agent-state'>
                <span data-agent='idle'>{t('landing.hero.flow.idle')}</span>
                <code data-agent='line'>
                  <span>get_context →</span> {item.id}
                  <Check size={13} />
                </code>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className='landing-flow-note'>{t('landing.hero.flow.note')}</p>
    </div>
  );
}
