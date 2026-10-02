import { Bot, MessagesSquare, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  historyOf,
  KnowledgeStatusBadge,
  NeedsReviewBadge,
} from '@/entities/knowledge-item';
import { useFormatMoment, useFormatWhen } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  Avatar,
  AvatarFallback,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';
import {
  KnowledgeSourceDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeSourceDto,
  type MemberDto,
} from '@intentra/contracts/workspace';

/** A hint's trigger sits above the row's cover link, so pointing at it shows the hint. */
const HINTED = 'relative z-10 cursor-default';

const { manual, 'analysis-run': analysisRun } = KnowledgeSourceDtoSchema.enum;

/** The agent's mark after a Member's name; Intentra's own check of the Project is named whole instead. */
const SOURCE_ICONS: Record<
  Exclude<KnowledgeSourceDto, typeof manual | typeof analysisRun>,
  LucideIcon
> = {
  [KnowledgeSourceDtoSchema.enum['intentra-agent']]: MessagesSquare,
  [KnowledgeSourceDtoSchema.enum['external-agent']]: Bot,
};

/**
 * A row's facts in one right-hand column: who proposed it and through which
 * agent on top, then one badge with its status and how long ago it last
 * changed, the same shape whatever the status.
 */
export function RowMeta({
  item,
  memberOf,
}: {
  readonly item: KnowledgeItemDto;
  readonly memberOf: (memberId: string) => MemberDto | undefined;
}) {
  const formatMoment = useFormatMoment();
  const formatWhen = useFormatWhen();
  const { t } = useTranslation();
  const history = historyOf(item);
  const latest = history.at(-1);
  const author = item.authorId === null ? undefined : memberOf(item.authorId);
  // Intentra itself, in an Analysis Run, has no Member.
  const authorName =
    item.authorId === null ? t('brand') : author ? displayName(author) : '—';
  // Every event in full, oldest first, for whoever wants the whole story.
  const story = history.map(event => {
    const member =
      event.memberId === null ? undefined : memberOf(event.memberId);
    return [
      t(`knowledgeItem.events.${event.type}`),
      formatMoment(event.at),
      event.memberId === null ? t('brand') : member && displayName(member),
    ]
      .filter(Boolean)
      .join(' · ');
  });

  return (
    <span className='flex flex-col items-start gap-2 sm:w-56 sm:items-end'>
      {item.source === analysisRun ? (
        <AuditTag />
      ) : (
        <span className='flex max-w-full min-w-0 items-center gap-1.5 text-foreground/80'>
          <Avatar className='size-4'>
            <AvatarFallback className='text-[0.5625rem] font-medium uppercase'>
              {item.authorId === null
                ? t('brand').charAt(0)
                : initialsOf(author)}
            </AvatarFallback>
          </Avatar>
          <span className='truncate'>{authorName}</span>
          <AgentTag source={item.source} who={authorName} />
        </span>
      )}
      <span className='flex flex-wrap items-center gap-1.5 sm:justify-end'>
        {item.needsReview && <NeedsReviewBadge />}
        <Tooltip>
          <TooltipTrigger render={<span className={HINTED} />}>
            <KnowledgeStatusBadge
              status={item.status}
              detail={
                latest && (
                  <span className='tabular-nums'>{formatWhen(latest.at)}</span>
                )
              }
            />
            <span className='sr-only'>{story.join('. ')}</span>
          </TooltipTrigger>
          <TooltipContent side='bottom' align='end' className='max-w-none'>
            <span className='flex flex-col gap-0.5 whitespace-nowrap tabular-nums'>
              {story.map(line => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </TooltipContent>
        </Tooltip>
      </span>
    </span>
  );
}

/** Which agent wrote the item for its author, as a mark and its short name after the author's name (`♡ Intentra`, robot `MCP`); nothing when a person wrote it by hand. */
function AgentTag({
  source,
  who,
}: {
  readonly source: KnowledgeSourceDto;
  readonly who: string;
}) {
  const { t } = useTranslation();
  if (source === manual || source === analysisRun) {
    return null;
  }
  const Icon = SOURCE_ICONS[source];
  const hint = t(`knowledge.agentHints.${source}`, { who });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              'flex shrink-0 items-center gap-1.5 text-foreground/80',
              HINTED,
            )}
          />
        }
      >
        <Icon aria-hidden className='size-3 text-muted-foreground' />
        <span aria-hidden className='font-medium'>
          {t(`knowledge.agentTags.${source}`)}
        </span>
        <span className='sr-only'>{hint}</span>
      </TooltipTrigger>
      <TooltipContent side='bottom' align='end' className='max-w-64'>
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

/** Intentra's own check of the Project as the author: its name alone, no avatar or mark, its meaning in a hint. */
function AuditTag() {
  const { t } = useTranslation();
  const hint = t(`knowledge.agentHints.${analysisRun}`, { who: t('brand') });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className={cn('font-medium text-foreground/80', HINTED)} />
        }
      >
        <span aria-hidden>{t(`sources.${analysisRun}`)}</span>
        <span className='sr-only'>{hint}</span>
      </TooltipTrigger>
      <TooltipContent side='bottom' align='end' className='max-w-64'>
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

function displayName(member: MemberDto): string {
  return member.name || member.email;
}

/** Up to two letters: the first of the name's first two words, or of the email. */
function initialsOf(member: MemberDto | undefined): string {
  if (!member) {
    return '?';
  }
  const words = member.name.trim().split(/\s+/).filter(Boolean);
  return words.length > 0
    ? words
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
    : member.email.charAt(0);
}
