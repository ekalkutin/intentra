import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

const EASE = 'expo.out';

/**
 * The sheet draws itself: construction lines and the headline on load, section
 * rules and headings as they are reached, the approval mark in the title block
 * last. Everything is visible without it; nothing runs under reduced motion.
 */
export function useSheetMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: EASE } })
          .from(
            '.landing-grid',
            {
              clipPath: 'inset(0 0 100% 0)',
              duration: 1.8,
              ease: 'power2.inOut',
              clearProps: 'clipPath',
            },
            0,
          )
          .from('.landing-header > *', { autoAlpha: 0, duration: 0.8 }, 0.1)
          .from(
            '.landing-hero h1 .landing-mask > span',
            { yPercent: 115, duration: 1.1, stagger: 0.12 },
            0.15,
          )
          .from(
            '.landing-hero-accent',
            { '--slnt': 0, fontWeight: 600, duration: 1.4, ease: 'power3.out' },
            0.45,
          )
          .from(
            '.landing-hero-copy > p, .landing-hero-actions',
            { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 },
            0.55,
          )
          .from(
            '.landing-divider-lead .landing-rule',
            { scaleX: 0, transformOrigin: 'left center', duration: 1.2 },
            0.5,
          )
          .from(
            '.landing-divider-lead .landing-cross',
            { scale: 0, rotate: 90, duration: 0.7, stagger: 0.25 },
            0.7,
          )
          .from(
            '.landing-product',
            {
              clipPath: 'inset(0 0 100% 0)',
              y: 32,
              duration: 1.2,
              clearProps: 'clipPath,transform',
            },
            0.6,
          );

        gsap.utils
          .toArray<HTMLElement>('.landing-divider:not(.landing-divider-lead)')
          .forEach(divider => {
            gsap.from(divider.querySelector('.landing-rule'), {
              scaleX: 0,
              transformOrigin: 'left center',
              ease: 'none',
              scrollTrigger: {
                trigger: divider,
                start: 'top 100%',
                end: 'top 72%',
                scrub: 0.6,
              },
            });
            gsap.from(divider.querySelectorAll('.landing-cross'), {
              scale: 0,
              rotate: 90,
              duration: 0.7,
              ease: EASE,
              stagger: 0.25,
              scrollTrigger: { trigger: divider, start: 'top 90%', once: true },
            });
          });

        SplitText.create('.landing-knowledge-heading h2', {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: split =>
            gsap.from(split.lines, {
              yPercent: 115,
              duration: 1,
              ease: EASE,
              stagger: 0.1,
              scrollTrigger: {
                trigger: '.landing-knowledge-heading',
                start: 'top 88%',
                once: true,
              },
            }),
        });

        // The relationship map is wired left to right, the way it is read.
        gsap
          .timeline({
            defaults: { ease: EASE },
            scrollTrigger: {
              trigger: '.landing-knowledge-map',
              start: 'top 78%',
              once: true,
            },
          })
          .from('.landing-rule-sheet', {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1,
            clearProps: 'clipPath',
          })
          .from(
            '.landing-knowledge-wires',
            {
              clipPath: 'inset(0 100% 0 0)',
              duration: 1.1,
              ease: 'power2.inOut',
              clearProps: 'clipPath',
            },
            0.2,
          )
          .from(
            '.landing-model-index, .landing-linked-record',
            { autoAlpha: 0, duration: 0.8, stagger: 0.12 },
            0.45,
          );

        gsap.from('.landing-mcp-panels', {
          clipPath: 'inset(0 0 0 100%)',
          duration: 1.2,
          ease: EASE,
          clearProps: 'clipPath',
          scrollTrigger: {
            trigger: '.landing-mcp-showcase',
            start: 'top 72%',
            once: true,
          },
        });

        gsap.from('.landing-faq [data-slot=accordion-item]', {
          autoAlpha: 0,
          y: 12,
          duration: 0.6,
          ease: EASE,
          stagger: 0.06,
          scrollTrigger: {
            trigger: '.landing-faq',
            start: 'top 70%',
            once: true,
          },
        });

        gsap.from('.landing-footer-brand', {
          clipPath: 'inset(100% 0 0 0)',
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: '.landing-footer-brand',
            start: 'top 100%',
            end: 'top 62%',
            scrub: 0.6,
          },
        });

        // The closing claim gains weight as it is reached, echoing the headline.
        gsap.from('.landing-closing h2', {
          fontWeight: 250,
          ease: 'none',
          scrollTrigger: {
            trigger: '.landing-closing',
            start: 'top 92%',
            end: 'top 38%',
            scrub: 0.6,
          },
        });

        gsap.from('.landing-sign path', {
          drawSVG: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: '.landing-title-block',
            start: 'top 88%',
            once: true,
          },
        });
      });

      // A drafting crosshair with a coordinate readout, over the claim only.
      media.add(
        '(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 761px)',
        () => {
          const hero =
            scope.current?.querySelector<HTMLElement>('.landing-hero');
          const cross = hero?.querySelector<HTMLElement>('.landing-crosshair');
          if (!hero || !cross) return;
          const [vertical, horizontal] = cross.querySelectorAll('i');
          const readout = cross.querySelector('code');
          if (!vertical || !horizontal || !readout) return;
          const follow = { duration: 0.35, ease: 'power3.out' };
          const lineX = gsap.quickTo(vertical, 'x', follow);
          const lineY = gsap.quickTo(horizontal, 'y', follow);
          const readX = gsap.quickTo(readout, 'x', follow);
          const readY = gsap.quickTo(readout, 'y', follow);
          const figure = (value: number) =>
            String(Math.round(value)).padStart(4, '0');
          const move = (event: PointerEvent) => {
            const bounds = hero.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            lineX(x);
            lineY(y);
            readX(x);
            readY(y);
            readout.textContent = `X ${figure(x)}  Y ${figure(y)}`;
            gsap.to(cross, { autoAlpha: 1, duration: 0.3, overwrite: true });
          };
          const leave = () =>
            gsap.to(cross, { autoAlpha: 0, duration: 0.4, overwrite: true });
          hero.addEventListener('pointermove', move);
          hero.addEventListener('pointerleave', leave);
          return () => {
            hero.removeEventListener('pointermove', move);
            hero.removeEventListener('pointerleave', leave);
          };
        },
      );
    },
    { scope },
  );
}
