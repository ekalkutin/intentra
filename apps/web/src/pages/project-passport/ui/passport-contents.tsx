import { ChevronDown, CircleDashed } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui';

import type { PassportChapter } from '../model/chapters';
import { chapterAnchor } from '../model/use-chapter-in-view';

type ContentsProps = {
  readonly chapters: readonly PassportChapter[];
  readonly current: string | null;
  readonly open: (id: string) => void;
};

/** Where the ink segment stands on the rail: the chapter being read, from the rail's top. */
type Mark = { readonly top: number; readonly height: number };

/**
 * The Passport's chapters by number, the empty ones in muted text with the
 * pending mark, the one being read marked by an ink segment on the rail that
 * slides to it, the stretch above it already read in a fainter ink; a
 * chapter opens on click.
 */
function ChapterList({ chapters, current, open }: ContentsProps) {
  const { t } = useTranslation();
  const list = useRef<HTMLOListElement>(null);
  const [mark, setMark] = useState<Mark | null>(null);

  // Measured, not computed: a title may wrap, and the folded list only has a size once open.
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) {
      return;
    }
    const measure = () => {
      const link = element.querySelector<HTMLElement>('[aria-current]');
      setMark(link ? { top: link.offsetTop, height: link.offsetHeight } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [current, chapters]);

  return (
    <ol ref={list} className='relative flex flex-col'>
      <span aria-hidden className='absolute inset-y-0 left-0 w-px bg-border' />
      {mark && (
        <>
          <span
            aria-hidden
            className='absolute top-0 left-0 w-px bg-foreground/25 transition-[height] duration-500 ease-out-expo motion-reduce:transition-none'
            style={{ height: mark.top }}
          />
          <span
            aria-hidden
            className='absolute top-0 left-0 w-px bg-foreground transition-[translate,height] duration-500 ease-out-expo motion-reduce:transition-none'
            style={{ translate: `0 ${mark.top}px`, height: mark.height }}
          />
        </>
      )}
      {chapters.map((chapter, index) => {
        const active = chapter.id === current;
        const written = chapter.count > 0;
        return (
          <li key={chapter.id}>
            <a
              href={`#${chapterAnchor(chapter.id)}`}
              aria-current={active ? 'location' : undefined}
              onClick={event => {
                event.preventDefault();
                open(chapter.id);
              }}
              className={cn(
                'group/chapter flex items-baseline gap-2 rounded-sm py-1.5 pr-1 pl-3.5 text-sm transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
                active
                  ? 'text-foreground'
                  : written
                    ? 'text-foreground/70'
                    : 'text-muted-foreground/80',
              )}
            >
              <span
                className={cn(
                  'w-3 shrink-0 font-mono text-xs tabular-nums transition-colors duration-150 group-hover/chapter:text-foreground',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {index + 1}
              </span>
              <span className='min-w-0 flex-1 text-balance'>
                {t(`passport.chapters.${chapter.id}`)}
              </span>
              {/* Only an empty chapter says so, with the pending mark, so the numbers on the left stand alone. */}
              {!written && (
                <CircleDashed
                  aria-label={t('passport.notDescribed')}
                  className='size-3.5 shrink-0 translate-y-0.5 text-muted-foreground/70'
                />
              )}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/** The contents beside the text, staying in view as it scrolls (from 1280px). */
export function PassportContents(props: ContentsProps) {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('passport.contents')} className='sticky top-8'>
      <h2 className='mb-3 flex items-baseline justify-between gap-2 pl-3.5 text-xs'>
        <span className='font-medium text-foreground'>
          {t('passport.contents')}
        </span>
        <span className='text-muted-foreground tabular-nums'>
          {t('passport.written', {
            written: props.chapters.filter(chapter => chapter.count > 0).length,
            total: props.chapters.length,
          })}
        </span>
      </h2>
      <ChapterList {...props} />
    </nav>
  );
}

/** The contents above the text where there is no room beside it, folded until asked for. */
export function PassportContentsFolded(props: ContentsProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const written = props.chapters.filter(chapter => chapter.count > 0).length;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <nav aria-label={t('passport.contents')}>
        <CollapsibleTrigger className='flex w-full items-center gap-2 rounded-sm border-b border-border pb-3 text-left text-sm font-medium'>
          {t('passport.contents')}
          <span className='text-xs font-normal text-muted-foreground tabular-nums'>
            {t('passport.written', {
              written,
              total: props.chapters.length,
            })}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              'ml-auto size-4 text-muted-foreground transition-transform duration-150',
              expanded && 'rotate-180',
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className='pt-3'>
          <ChapterList
            {...props}
            open={id => {
              setExpanded(false);
              props.open(id);
            }}
          />
        </CollapsibleContent>
      </nav>
    </Collapsible>
  );
}
