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
        const lead = SplitText.create('.landing-hero-lead', { type: 'chars' });
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
            lead.chars,
            {
              yPercent: 110,
              autoAlpha: 0,
              filter: 'blur(10px)',
              duration: 0.9,
              stagger: 0.035,
            },
            0.15,
          )
          .from(
            '.landing-rotator',
            {
              yPercent: 115,
              '--slnt': 0,
              fontWeight: 600,
              duration: 1.3,
              ease: 'power3.out',
            },
            0.5,
          )
          .from(
            '.landing-hero-copy > p, .landing-hero-actions',
            { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 },
            0.6,
          )
          .from(
            '.landing-hero-lines',
            {
              clipPath: 'inset(0 0 100% 0)',
              duration: 2,
              ease: 'power2.inOut',
              clearProps: 'clipPath',
            },
            0.2,
          );

        // The second line keeps naming what the intent turns into. Every swap
        // states both ends of both phrases, so none is ever left half-way.
        const phrases = gsap.utils.toArray<HTMLElement>(
          '.landing-rotator > span',
        );
        const shownAt = { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)' };
        const below = { yPercent: 110, autoAlpha: 0, filter: 'blur(8px)' };
        gsap.set(phrases, below);
        gsap.set(phrases[0]!, shownAt);
        let shown = 0;
        const rotate = () => {
          const leaving = phrases[shown]!;
          shown = (shown + 1) % phrases.length;
          const coming = phrases[shown]!;
          gsap.set(
            phrases.filter(phrase => phrase !== leaving && phrase !== coming),
            below,
          );
          gsap.fromTo(leaving, shownAt, {
            yPercent: -110,
            autoAlpha: 0,
            filter: 'blur(8px)',
            duration: 0.6,
            ease: 'power3.in',
            overwrite: true,
          });
          gsap.fromTo(coming, below, {
            ...shownAt,
            duration: 0.9,
            ease: EASE,
            delay: 0.55,
            overwrite: true,
          });
          next = gsap.delayedCall(3.6, rotate);
        };
        let next = gsap.delayedCall(4.4, rotate);
        ScrollTrigger.create({
          trigger: '.landing-hero',
          start: 'top bottom',
          end: 'bottom top',
          onToggle: self => (self.isActive ? next.resume() : next.pause()),
        });

        gsap.utils.toArray<HTMLElement>('.landing-divider').forEach(divider => {
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
            '.landing-inbox, .landing-linked-record, .landing-delivery-agent',
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
      });
    },
    { scope },
  );
}
