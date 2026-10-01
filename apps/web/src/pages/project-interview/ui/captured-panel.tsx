import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KnowledgeItemSummary,
  useKnowledgeItemQuery,
  useKnowledgeScope,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';

import {
  CAPTURED_KEY_ATTRIBUTE,
  TILE_CONTENT_ATTRIBUTE,
  TILE_PLACEHOLDER_ATTRIBUTE,
  useIncoming,
} from './knowledge-flight';

/**
 * What the Conversation produced: each item the agent recorded or edited,
 * read live, so its status follows approvals made elsewhere.
 */
export function CapturedPanel({ keys }: { readonly keys: readonly string[] }) {
  const { t } = useTranslation();

  return (
    <aside className='hidden w-72 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border px-4 py-5 xl:flex'>
      <h2 className='text-sm font-semibold'>
        {t('interview.captured')}
        {keys.length > 0 && (
          <span className='ml-2 font-mono text-xs font-normal text-muted-foreground tabular-nums'>
            {keys.length}
          </span>
        )}
      </h2>
      {keys.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          {t('interview.capturedEmpty')}
        </p>
      ) : (
        // Each item keeps its own gap, so a slot opening from nothing adds none.
        <ul className='flex flex-col'>
          {[...keys].reverse().map(key => (
            <CapturedItem key={key} itemKey={key} />
          ))}
        </ul>
      )}
    </aside>
  );
}

/**
 * One item the Conversation recorded. A Draft written while the Member
 * watches gets its place first: the slot opens, pushing the others down, and
 * shows a skeleton until its card lands on it; the card itself (already
 * rendered underneath, unseen) is what the flight copies.
 */
function CapturedItem({ itemKey }: { readonly itemKey: string }) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();
  const waiting = useIncoming(itemKey);
  // A slot for a card on its way opens from nothing; any other is just there.
  const [open, setOpen] = useState(!waiting);
  const { data, isLoading } = useKnowledgeItemQuery({
    workspaceId: scope.workspaceId,
    projectId: scope.projectId,
    key: itemKey,
  });

  useEffect(() => {
    if (open) {
      return;
    }
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <li
      className='grid transition-[grid-template-rows] duration-500 ease-(--ease-out-expo) motion-reduce:transition-none'
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className='min-h-0 overflow-hidden'>
        <div
          {...{ [CAPTURED_KEY_ATTRIBUTE]: itemKey }}
          className='relative mb-2 rounded-lg border border-border bg-card p-3 transition-colors focus-within:bg-accent/60 hover:bg-accent/60'
        >
          <div
            {...{ [TILE_CONTENT_ATTRIBUTE]: '' }}
            className={cn(waiting && 'opacity-0')}
          >
            {isLoading ? (
              <TileSkeleton />
            ) : data ? (
              <KnowledgeItemSummary
                item={data}
                clamp={2}
                compact
                title={
                  <Link
                    to={scope.itemPath(itemKey)}
                    className='outline-none after:absolute after:inset-0 after:rounded-lg after:content-[""] focus-visible:after:ring-2 focus-visible:after:ring-ring/50'
                  >
                    {data.title}
                  </Link>
                }
              />
            ) : (
              <p className='text-xs text-muted-foreground'>
                <span className='font-mono'>{itemKey}</span> ·{' '}
                {t('interview.capturedMissing')}
              </p>
            )}
          </div>
          {waiting && (
            <div
              {...{ [TILE_PLACEHOLDER_ATTRIBUTE]: '' }}
              aria-hidden
              className='absolute inset-0 p-3'
            >
              <TileSkeleton />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function TileSkeleton() {
  return (
    <div aria-busy className='flex flex-col gap-2'>
      <Skeleton className='h-3 w-24' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-2/3' />
    </div>
  );
}
