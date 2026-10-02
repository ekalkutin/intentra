import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  HISTORY_EVENTS,
  historyOf,
  KnowledgeKeyLink,
  type HistoryEvent,
} from '@/entities/knowledge-item';
import { useFormatDate } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

/** Where the item came from and its version, then what happened to it, who did it and why. */
export function ItemProperties({
  item,
  nameOf,
}: {
  readonly item: KnowledgeItemDto;
  readonly nameOf: (memberId: string) => string | undefined;
}) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col gap-8'>
      {/* No headings: label and value pairs speak for themselves, and so does the timeline under them. */}
      <section aria-label={t('knowledgeItem.properties')}>
        <dl className='grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm'>
          {/* Its Kind, key and status lead the page under the title; here only what they do not say, as plain values. */}
          <Property label={t('knowledgeItem.source')}>
            {t(`sources.${item.source}`)}
          </Property>
          <Property label={t('knowledgeItem.version')}>
            <span className='tabular-nums'>{item.version}</span>
          </Property>
          {item.supersedes && (
            <Property label={t('knowledgeItem.replaces')}>
              <KnowledgeKeyLink itemKey={item.supersedes} />
            </Property>
          )}
          {item.supersededByKey && (
            <Property label={t('knowledgeItem.replacedBy')}>
              <KnowledgeKeyLink itemKey={item.supersededByKey} />
            </Property>
          )}
        </dl>
      </section>
      <section aria-label={t('knowledgeItem.history')}>
        <ol className='relative flex flex-col gap-4 before:absolute before:top-2 before:bottom-2 before:left-[0.1875rem] before:w-px before:bg-border'>
          {historyOf(item).map(event => (
            <HistoryEntry
              key={event.type}
              event={event}
              who={
                event.memberId === null ? t('brand') : nameOf(event.memberId)
              }
              reason={reasonOf(item, event)}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}

function reasonOf(item: KnowledgeItemDto, event: HistoryEvent): string | null {
  if (event.type === HISTORY_EVENTS.rejected) {
    return item.rejectionReason;
  }
  if (event.type === HISTORY_EVENTS.retired) {
    return item.retirementReason;
  }
  return null;
}

/** Each event's dot: the approval stands out, the rest stay quiet. */
const DOTS: Record<HistoryEvent['type'], string> = {
  recorded: 'bg-muted-foreground/60',
  edited: 'bg-muted-foreground/60',
  approved: 'bg-success',
  rejected: 'bg-destructive',
  superseded: 'bg-muted-foreground/60',
  retired: 'bg-muted-foreground/60',
};

function HistoryEntry({
  event,
  who,
  reason,
}: {
  readonly event: HistoryEvent;
  readonly who: string | undefined;
  readonly reason: string | null;
}) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();

  return (
    <li className='relative flex gap-3 text-sm'>
      <span
        aria-hidden
        className={cn(
          'mt-1.5 size-[0.4375rem] shrink-0 rounded-full ring-2 ring-background',
          DOTS[event.type],
        )}
      />
      <div className='min-w-0'>
        <p>
          {t(`knowledgeItem.events.${event.type}`)}{' '}
          <span className='text-xs text-muted-foreground tabular-nums'>
            {formatDate(event.at)}
          </span>
        </p>
        <p className='text-xs break-all text-muted-foreground'>{who ?? '—'}</p>
        {reason && (
          <p className='mt-1 text-xs text-pretty whitespace-pre-line text-muted-foreground'>
            {reason}
          </p>
        )}
      </div>
    </li>
  );
}

function Property({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <>
      <dt className='text-xs leading-5 text-muted-foreground'>{label}</dt>
      <dd className='flex min-w-0 items-center leading-5'>{children}</dd>
    </>
  );
}
