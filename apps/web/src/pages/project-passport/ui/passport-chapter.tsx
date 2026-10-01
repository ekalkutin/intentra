import { ArrowRight, MessagesSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { KindIcon } from '@/entities/knowledge-item';
import type { InterviewOpening } from '@/shared/config';
import { Button } from '@/shared/ui';

import { chapterItems } from '../model/chapter-items';
import {
  REQUIREMENT_SORTS,
  type PassportChapter as Chapter,
  type PassportGroup,
} from '../model/chapters';
import { chapterAnchor } from '../model/use-chapter-in-view';

import { PassportEntry } from './passport-entry';

/** How many items a group shows; the rest wait in Knowledge. */
export const ENTRIES_SHOWN = 10;

/**
 * One chapter of the Passport: its number and title, what it covers, and a
 * quiet "Обсудить" at the title's end; then its items group by group, or a
 * line saying it is empty. "Обсудить" opens a new Conversation that has
 * already asked the agent to fill the chapter in, or to add to what it holds.
 */
export function PassportChapter({
  chapter,
  number,
  interviewPath,
  kindPath,
}: {
  readonly chapter: Chapter;
  readonly number: number;
  /** Where to talk the chapter through, or none when the whole Passport is empty. */
  readonly interviewPath: string | null;
  /** The Knowledge page's list of a Kind's Approved items. */
  readonly kindPath: (group: PassportGroup) => string;
}) {
  const { t } = useTranslation();
  const titleId = `${chapterAnchor(chapter.id)}-title`;
  const name = t(`passport.chapters.${chapter.id}`);
  const about = t(`passport.chapterDescriptions.${chapter.id}`);
  const { named, rest } = chapterItems(chapter);
  const values = {
    chapter: name,
    about: about.charAt(0).toLowerCase() + about.slice(1),
  };
  // An empty chapter is filled in; a written one is added to, naming what it holds.
  const opening: InterviewOpening = {
    opening:
      chapter.count === 0
        ? t('passport.discussPrompt', values)
        : t('passport.discussMorePrompt', {
            ...values,
            items: [
              ...named,
              ...(rest > 0 ? [t('passport.discussMore', { count: rest })] : []),
            ].join(', '),
          }),
  };

  return (
    <section
      id={chapterAnchor(chapter.id)}
      aria-labelledby={titleId}
      className='flex scroll-mt-8 flex-col gap-6 border-t border-border pt-12 first:border-t-0 first:pt-0'
    >
      <header className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h2
            id={titleId}
            className='flex items-baseline gap-2.5 text-sm font-semibold'
          >
            <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
              {number}
            </span>
            {name}
          </h2>
          <p className='mt-0.5 max-w-2xl text-sm text-pretty text-muted-foreground'>
            {about}
          </p>
        </div>
        {interviewPath && (
          <DiscussButton
            to={interviewPath}
            opening={opening}
            label={t('passport.discussLabel', { chapter: name })}
          />
        )}
      </header>
      {chapter.count === 0 ? (
        <p className='text-sm text-muted-foreground'>
          {t('passport.notDescribed')}
        </p>
      ) : (
        chapter.groups.map(group => (
          <Group
            key={`${group.kind}-${group.requirements ?? ''}`}
            group={group}
            titled={chapter.mixed}
            morePath={kindPath(group)}
          />
        ))
      )}
    </section>
  );
}

function Group({
  group,
  titled,
  morePath,
}: {
  readonly group: PassportGroup;
  readonly titled: boolean;
  readonly morePath: string;
}) {
  const { t } = useTranslation();
  const shown = group.items.slice(0, ENTRIES_SHOWN);
  const hidden = group.total - shown.length;
  const title =
    group.requirements === REQUIREMENT_SORTS.functional
      ? t('passport.functionalRequirements')
      : group.requirements === REQUIREMENT_SORTS.quality
        ? t('passport.qualityRequirements')
        : t(`kinds.${group.kind}`);

  return (
    <div className='flex flex-col gap-6 [&+&]:mt-4'>
      {titled && (
        <h3 className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
          <KindIcon kind={group.kind} />
          {title}
          <span className='font-mono text-xs font-normal tabular-nums'>
            {group.total}
          </span>
        </h3>
      )}
      {shown.map(item => (
        <PassportEntry key={item.id} item={item} />
      ))}
      {hidden > 0 && (
        <Link
          to={morePath}
          className='inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground underline decoration-muted-foreground/50 underline-offset-[0.2em] hover:text-foreground hover:decoration-foreground'
        >
          {t('passport.more', { count: hidden })}
          <ArrowRight aria-hidden className='size-3.5' />
        </Link>
      )}
    </div>
  );
}

/**
 * The way into the Interview: a quiet ghost button like the rest of the
 * Passport. Only the page change it starts is animated, dissolving into the
 * Conversation it opens (a view transition; still under reduced motion).
 */
function DiscussButton({
  to,
  opening,
  label,
}: {
  readonly to: string;
  readonly opening: InterviewOpening;
  readonly label: string;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant='ghost'
      size='sm'
      aria-label={label}
      className='-mt-1 -mr-2 shrink-0 text-muted-foreground hover:text-foreground'
      // A new Conversation that opens with the chapter as its first message.
      render={<Link to={to} state={opening} viewTransition />}
      nativeButton={false}
    >
      <MessagesSquare />
      {/* Icon only below 640px, so the chapter's line keeps its width. */}
      <span className='max-sm:hidden'>{t('passport.discuss')}</span>
    </Button>
  );
}
