import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import type { KnowledgeListState } from '@/entities/knowledge-item';
import { knowledgeItemPath } from '@/shared/config';
import { RESTORE_SCROLL_STATE } from '@/shared/lib';
import {
  Button,
  Kbd,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';

import type { Neighbours } from '../model/neighbours';
import type { ProjectSlugs } from '../model/slugs';

/** Keys that step through the list, as in mail and issue trackers. */
const STEP_KEYS = { previous: 'k', next: 'j' } as const;

/**
 * The way back to the list the item was opened from, and through that list
 * item by item, with the buttons or with K and J.
 */
export function ItemStepper({
  listPath,
  slugs,
  neighbours,
  listState,
}: {
  readonly listPath: string;
  readonly slugs: ProjectSlugs;
  readonly neighbours: Neighbours | null;
  readonly listState: KnowledgeListState | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pathOf = (key: string | null) =>
    key ? knowledgeItemPath(slugs.workspaceSlug, slugs.projectSlug, key) : null;
  const previous = pathOf(neighbours?.previous ?? null);
  const next = pathOf(neighbours?.next ?? null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"], [role="alertdialog"], [role="menu"]',
        )
      ) {
        return;
      }
      const to =
        event.key === STEP_KEYS.previous
          ? previous
          : event.key === STEP_KEYS.next
            ? next
            : null;
      if (to) {
        event.preventDefault();
        void navigate(to, { state: listState });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previous, next, navigate, listState]);

  return (
    <div className='-mt-4 -mb-4 flex items-center justify-between gap-4'>
      <Button
        variant='ghost'
        size='sm'
        className='-ml-2 text-muted-foreground'
        render={<Link to={listPath} state={RESTORE_SCROLL_STATE} />}
        nativeButton={false}
      >
        <ArrowLeft />
        {t('knowledgeItem.back')}
      </Button>
      {neighbours?.position && (
        <div className='flex items-center gap-1'>
          <span className='mr-1 font-mono text-xs text-muted-foreground tabular-nums'>
            {t('knowledgeItem.position', {
              position: neighbours.position,
              total: neighbours.total,
            })}
          </span>
          <StepButton
            to={previous}
            state={listState}
            label={t('knowledgeItem.previous')}
            hint={STEP_KEYS.previous}
          >
            <ChevronUp />
          </StepButton>
          <StepButton
            to={next}
            state={listState}
            label={t('knowledgeItem.next')}
            hint={STEP_KEYS.next}
          >
            <ChevronDown />
          </StepButton>
        </div>
      )}
    </div>
  );
}

function StepButton({
  to,
  state,
  label,
  hint,
  children,
}: {
  readonly to: string | null;
  readonly state: KnowledgeListState | null;
  readonly label: string;
  readonly hint: string;
  readonly children: React.ReactNode;
}) {
  if (!to) {
    return (
      <Button variant='ghost' size='icon-sm' disabled aria-label={label}>
        {children}
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label={label}
            render={<Link to={to} state={state} />}
            nativeButton={false}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {label} <Kbd>{hint.toUpperCase()}</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
