import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { cn } from '@/shared/lib';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui';

import { useKnowledgeItemQuery } from '../api/knowledge-api';
import { useKnowledgeScope } from '../model/scope';

import { KnowledgeItemSummary } from './item-summary';

/** A Knowledge Key that opens its item and previews it on hover or focus. */
export function KnowledgeKeyLink({
  itemKey,
  className,
}: {
  readonly itemKey: string;
  readonly className?: string;
}) {
  const scope = useKnowledgeScope();
  const [open, setOpen] = useState(false);

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger
        delay={250}
        closeDelay={80}
        render={
          <Link
            to={scope.itemPath(itemKey)}
            className={cn(
              'rounded-sm font-mono text-[0.85em] whitespace-nowrap text-foreground underline decoration-muted-foreground/50 underline-offset-[0.2em] hover:decoration-foreground',
              className,
            )}
          />
        }
      >
        {itemKey}
      </HoverCardTrigger>
      <HoverCardContent align='start' className='w-80 p-3'>
        {open && <KeyPreview itemKey={itemKey} />}
      </HoverCardContent>
    </HoverCard>
  );
}

function KeyPreview({ itemKey }: { readonly itemKey: string }) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();
  const { data, isLoading } = useKnowledgeItemQuery({
    workspaceId: scope.workspaceId,
    projectId: scope.projectId,
    key: itemKey,
  });

  if (isLoading) {
    return (
      <div aria-busy className='flex flex-col gap-2'>
        <span className='h-3 w-24 animate-pulse rounded-md bg-muted' />
        <span className='h-4 w-full animate-pulse rounded-md bg-muted' />
        <span className='h-8 w-full animate-pulse rounded-md bg-muted' />
      </div>
    );
  }
  if (!data) {
    return (
      <p className='text-sm text-muted-foreground'>
        {t('knowledge.previewMissing', { key: itemKey })}
      </p>
    );
  }

  return <KnowledgeItemSummary item={data} clamp={4} />;
}
