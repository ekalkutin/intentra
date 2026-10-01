import { useCallback, useEffect, useRef, useState } from 'react';

const ANCHOR_PREFIX = 'passport-';

/** The element id of a Passport chapter, which the contents and the address link to. */
export function chapterAnchor(id: string): string {
  return `${ANCHOR_PREFIX}${id}`;
}

/** The nearest ancestor that scrolls, or the page itself. */
function scrollerOf(element: HTMLElement): HTMLElement {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return node;
    }
  }

  return document.documentElement;
}

/**
 * The chapter being read, and a way to open one. The chapter being read is
 * the last whose title has passed the upper third of the screen, or the
 * last of all once the text is scrolled to its end. An opened chapter stays
 * current until the reader scrolls themselves, since short chapters at the
 * end never reach the upper third; it also goes into the address, so a
 * chapter can be linked to, and the address's chapter opens on load.
 */
export function useChapterInView(ids: readonly string[]): {
  readonly current: string | null;
  readonly open: (id: string) => void;
} {
  const [current, setCurrent] = useState<string | null>(ids[0] ?? null);
  const opened = useRef<string | null>(null);
  const key = ids.join(' ');

  useEffect(() => {
    const chapters = ids.flatMap(id => {
      const element = document.getElementById(chapterAnchor(id));
      return element ? [{ id, element }] : [];
    });
    const first = chapters[0];
    if (!first) {
      return;
    }
    const scroller = scrollerOf(first.element);
    const pick = () => {
      if (opened.current) {
        setCurrent(opened.current);
        return;
      }
      const atEnd =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      const line = window.innerHeight / 3;
      const passed = chapters.filter(
        ({ element }) => element.getBoundingClientRect().top <= line,
      );
      setCurrent((atEnd ? chapters.at(-1) : passed.at(-1))?.id ?? first.id);
    };
    // The reader scrolling themselves lets go of an opened chapter.
    const release = () => {
      opened.current = null;
    };
    const target = scroller === document.documentElement ? window : scroller;
    target.addEventListener('scroll', pick, { passive: true });
    scroller.addEventListener('wheel', release, { passive: true });
    scroller.addEventListener('touchmove', release, { passive: true });
    window.addEventListener('keydown', release);

    const linked = decodeURIComponent(window.location.hash.slice(1));
    const fromAddress = chapters.find(({ id }) => chapterAnchor(id) === linked);
    if (fromAddress) {
      opened.current = fromAddress.id;
      fromAddress.element.scrollIntoView({ block: 'start' });
    }
    pick();

    return () => {
      target.removeEventListener('scroll', pick);
      scroller.removeEventListener('wheel', release);
      scroller.removeEventListener('touchmove', release);
      window.removeEventListener('keydown', release);
    };
    // `key` stands for `ids`, which may be a new array with the same chapters.
  }, [key]);

  const open = useCallback((id: string) => {
    const element = document.getElementById(chapterAnchor(id));
    if (!element) {
      return;
    }
    opened.current = id;
    setCurrent(id);
    // Past the router: a new location would send the canvas back to the top.
    window.history.replaceState(
      window.history.state,
      '',
      `#${chapterAnchor(id)}`,
    );
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    element.scrollIntoView({
      behavior: reduced.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  return { current, open };
}
