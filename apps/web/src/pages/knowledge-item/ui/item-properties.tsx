import { Bot, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  HISTORY_EVENTS,
  historyOf,
  KindBadge,
  KnowledgeKeyLink,
  KnowledgeStatusPair,
  type HistoryEvent,
} from '@/entities/knowledge-item';
import { useFormatDate } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  KnowledgeSourceDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

/** The item's frame at a glance, then what happened to it, who did it and why. */
export function ItemProperties({
  item,
  emailOf,
}: {
  readonly item: KnowledgeItemDto;
  readonly emailOf: (memberId: string) => string | undefined;
}) {
  const { t } = useTranslation();
  const SourceIcon =
    item.source === KnowledgeSourceDtoSchema.enum.manual ? UserRound : Bot;

  return (
    <div className='flex flex-col gap-8'>
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-semibold'>
          {t('knowledgeItem.properties')}
        </h2>
        <dl className='grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm'>
          <Property label={t('knowledgeItem.key')}>
            <span className='font-mono text-xs'>{item.key}</span>
          </Property>
          <Property label={t('knowledgeItem.kind')}>
            <KindBadge kind={item.kind} className='text-sm text-foreground' />
          </Property>
          <Property label={t('knowledgeItem.status')}>
            <KnowledgeStatusPair item={item} />
          </Property>
          <Property label={t('knowledgeItem.version')}>
            <span className='font-mono text-xs tabular-nums'>
              {t('knowledgeItem.versionValue', { version: item.version })}
            </span>
          </Property>
          <Property label={t('knowledgeItem.source')}>
            <span className='inline-flex items-center gap-1.5'>
              <SourceIcon
                aria-hidden
                className='size-3.5 text-muted-foreground'
              />
              {t(`sources.${item.source}`)}
            </span>
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
      <section className='flex flex-col gap-3'>
        <h2 className='text-sm font-semibold'>{t('knowledgeItem.history')}</h2>
        <ol className='relative flex flex-col gap-4 before:absolute before:top-2 before:bottom-2 before:left-[0.1875rem] before:w-px before:bg-border'>
          {historyOf(item).map(event => (
            <HistoryEntry
              key={event.type}
              event={event}
              who={
                event.memberId === null ? t('brand') : emailOf(event.memberId)
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
          <span className='font-mono text-xs text-muted-foreground tabular-nums'>
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
