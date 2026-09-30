import { AlertTriangle, Link2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { useKnowledgeItemQuery } from '@/api/knowledge-api';
import { InlineMarkdown } from '@/components/markdown';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type {
  KnowledgeKindDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import { Facts } from './facts';
import { KIND_BY_ID, kindOfKey, LINK_LABEL, STATUS_BY_ID } from './kinds';

export function KindBadge({
  kind,
  className,
}: {
  kind: KnowledgeKindDto;
  className?: string;
}) {
  const spec = KIND_BY_ID[kind];
  const Icon = spec.icon;
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium',
        spec.tone,
        className,
      )}
    >
      <Icon className='size-3' />
      {spec.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: KnowledgeStatusDto }) {
  const spec = STATUS_BY_ID[status];
  return (
    <Badge variant='outline' className={cn('border', spec.tone)}>
      {spec.label}
    </Badge>
  );
}

export function NeedsReviewBadge({ causes }: { causes?: string[] }) {
  const badge = (
    <Badge
      variant='outline'
      className='gap-1 border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300'
    >
      <AlertTriangle className='size-3' /> Требует проверки
    </Badge>
  );
  if (!causes?.length) return badge;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>Изменились: {causes.join(', ')}</TooltipContent>
    </Tooltip>
  );
}

/** What a Knowledge Item is about, shown when hovering a link to it. */
function KeyPreview({ itemKey }: { itemKey: string }) {
  const { workspaceId = '', projectId = '' } = useParams();
  const { data, isLoading, isError } = useKnowledgeItemQuery({
    workspaceId,
    projectId,
    key: itemKey,
  });

  if (isLoading) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <p className='text-sm text-muted-foreground'>
        {itemKey} не найден — возможно, удалён.
      </p>
    );
  }
  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='font-mono text-xs font-semibold'>{data.key}</span>
        <KindBadge kind={data.kind} />
        <StatusBadge status={data.status} />
        {data.needsReview && <NeedsReviewBadge />}
      </div>
      <div className='leading-snug font-medium text-balance'>{data.title}</div>
      <p className='line-clamp-4 text-[13px] leading-5 text-muted-foreground'>
        <InlineMarkdown>{data.mainField}</InlineMarkdown>
      </p>
      <Facts item={data} />
      {data.links.length > 0 && (
        <div className='space-y-0.5 border-t pt-2 text-xs text-muted-foreground'>
          {data.links.slice(0, 5).map(link => (
            <div
              key={`${link.type}:${link.key}`}
              className='flex items-center gap-1'
            >
              <Link2 className='size-3' />
              {LINK_LABEL[link.type]}{' '}
              <span className='font-mono'>{link.key}</span>
            </div>
          ))}
          {data.links.length > 5 && <div>и ещё {data.links.length - 5}</div>}
        </div>
      )}
      {data.status === 'obsolete' && data.supersededByKey && (
        <p className='text-xs text-muted-foreground'>
          Заменено на <span className='font-mono'>{data.supersededByKey}</span>
        </p>
      )}
    </div>
  );
}

/** A Knowledge Key that opens its item and previews it on hover. */
export function KeyLink({
  itemKey,
  className,
  preview = true,
}: {
  itemKey: string;
  className?: string;
  preview?: boolean;
}) {
  const { workspaceId, projectId } = useParams();
  const [open, setOpen] = useState(false);
  const spec = kindOfKey(itemKey);
  const link = (
    <Link
      to={`/w/${workspaceId}/p/${projectId}/knowledge/${itemKey}`}
      className={cn(
        'inline-flex items-center rounded px-1 font-mono text-xs font-medium underline-offset-2 hover:underline',
        spec?.tone ?? 'bg-muted',
        className,
      )}
    >
      {itemKey}
    </Link>
  );
  if (!preview) return link;
  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      openDelay={250}
      closeDelay={80}
    >
      <HoverCardTrigger asChild>{link}</HoverCardTrigger>
      <HoverCardContent className='w-80' align='start'>
        {open && <KeyPreview itemKey={itemKey} />}
      </HoverCardContent>
    </HoverCard>
  );
}
