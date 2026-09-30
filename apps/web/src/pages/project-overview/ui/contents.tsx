import { CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { KindIcon } from '@/entities/knowledge-item';
import {
  KNOWLEDGE_SEARCH_PARAMS,
  PROJECT_PAGES,
  projectPath,
} from '@/shared/config';
import { cn } from '@/shared/lib';
import { List, LIST_ROW_LINK_CLASS, StatusBadge } from '@/shared/ui';

import type { KindSummary } from '../model/summary';

/**
 * Every Kind with how many of its items are approved and how many are
 * Drafts; a Kind with items leads to them.
 */
export function Contents({
  kinds,
  workspaceSlug,
  projectSlug,
}: {
  readonly kinds: readonly KindSummary[];
  readonly workspaceSlug: string;
  readonly projectSlug: string;
}) {
  const { t } = useTranslation();
  const knowledgePath = projectPath(
    workspaceSlug,
    projectSlug,
    PROJECT_PAGES.knowledge,
  );

  return (
    <List>
      {kinds.map(({ kind, approved, drafts }) => {
        const empty = approved === 0 && drafts === 0;
        return (
          <li
            key={kind}
            className={
              empty
                ? 'flex items-center gap-3 px-4 py-3 text-sm'
                : 'relative flex items-center gap-3 px-4 py-3 text-sm transition-colors focus-within:bg-accent/60 hover:bg-accent/60'
            }
          >
            <KindIcon
              kind={kind}
              className={empty ? 'opacity-50' : undefined}
            />
            {empty ? (
              <span className='min-w-0 flex-1 truncate text-muted-foreground'>
                {t(`kinds.${kind}`)}
              </span>
            ) : (
              <Link
                to={`${knowledgePath}?${KNOWLEDGE_SEARCH_PARAMS.kind}=${kind}`}
                className={cn(
                  'min-w-0 flex-1 truncate font-medium',
                  LIST_ROW_LINK_CLASS,
                )}
              >
                {t(`kinds.${kind}`)}
              </Link>
            )}
            {drafts > 0 && (
              <StatusBadge status='pending'>
                {t('overview.drafts', { count: drafts })}
              </StatusBadge>
            )}
            <span
              className={
                approved > 0
                  ? 'flex w-12 items-center justify-end gap-1.5 font-mono'
                  : 'flex w-12 items-center justify-end font-mono text-muted-foreground'
              }
              title={t('overview.approved')}
            >
              {approved > 0 && (
                <CircleCheck aria-hidden className='size-3.5 text-success' />
              )}
              <span className='sr-only'>{t('overview.approved')}: </span>
              {approved > 0 ? approved : t('overview.nothing')}
            </span>
          </li>
        );
      })}
    </List>
  );
}
