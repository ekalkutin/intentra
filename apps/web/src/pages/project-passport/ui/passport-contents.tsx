import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
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

/**
 * The Passport's chapters: how many items each holds, the empty ones in
 * muted text, the one being read marked; a chapter opens on click.
 */
function ChapterList({ chapters, current, open }: ContentsProps) {
  const { t } = useTranslation();

  return (
    <ol className='flex flex-col border-l border-border'>
      {chapters.map((chapter, index) => {
        const active = chapter.id === current;
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
                '-ml-px flex items-baseline gap-2 border-l py-1 pr-1 pl-3 text-sm transition-colors duration-150 hover:text-foreground',
                active
                  ? 'border-foreground text-foreground'
                  : 'border-transparent',
                !active &&
                  (chapter.count > 0
                    ? 'text-foreground/80'
                    : 'text-muted-foreground'),
              )}
            >
              <span className='w-3 shrink-0 font-mono text-xs font-normal text-muted-foreground tabular-nums'>
                {index + 1}
              </span>
              <span className='min-w-0 flex-1 text-pretty'>
                {t(`passport.chapters.${chapter.id}`)}
              </span>
              <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
                {chapter.count > 0 ? chapter.count : t('passport.nothing')}
              </span>
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
      <h2 className='mb-2 text-xs text-muted-foreground'>
        {t('passport.contents')}
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
