import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KnowledgeItemSummary,
  useKnowledgeItemQuery,
  useKnowledgeScope,
} from '@/entities/knowledge-item';
import { Skeleton } from '@/shared/ui';

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
        <ul className='flex flex-col gap-2'>
          {[...keys].reverse().map(key => (
            <CapturedItem key={key} itemKey={key} />
          ))}
        </ul>
      )}
    </aside>
  );
}

function CapturedItem({ itemKey }: { readonly itemKey: string }) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();
  const { data, isLoading } = useKnowledgeItemQuery({
    workspaceId: scope.workspaceId,
    projectId: scope.projectId,
    key: itemKey,
  });

  return (
    <li className='relative rounded-lg border border-border bg-card p-3 transition-colors focus-within:bg-accent/60 hover:bg-accent/60'>
      {isLoading ? (
        <div aria-busy className='flex flex-col gap-2'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-4 w-full' />
        </div>
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
    </li>
  );
}
