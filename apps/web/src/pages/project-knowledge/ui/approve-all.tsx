import { CheckCheck, Link2, Lock, TriangleAlert } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  BULK_APPROVAL_BLOCKS,
  KindIcon,
  KNOWLEDGE_LIST_SIZE,
  planBulkApproval,
  useApproveKnowledgeItemsMutation,
  useKnowledgeItemsQuery,
  type BulkApprovalBlock,
  type InProject,
} from '@/entities/knowledge-item';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

/**
 * A group's rows share one column of keys, as wide as its longest key, so the
 * titles start on one line half a rem after it, as in the list.
 */
const LINES = 'grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2';
const LINE = 'col-span-3 grid grid-cols-subgrid items-baseline';

const BLOCK_ICONS: Record<BulkApprovalBlock, typeof Lock> = {
  [BULK_APPROVAL_BLOCKS.forbidden]: Lock,
  [BULK_APPROVAL_BLOCKS.needsReview]: TriangleAlert,
  [BULK_APPROVAL_BLOCKS.dependsOnBlocked]: Link2,
};

/**
 * Approves every Draft of the view at once (of its Kind, when one is chosen),
 * after the person has seen the list: each with the Drafts it depends on, in
 * one all-or-nothing step; what cannot go is left out and said why.
 */
export function ApproveAll({
  scope,
  kind,
  count,
}: {
  readonly scope: InProject;
  readonly kind: KnowledgeKindDto | null;
  /** The Drafts the view shows, to say on the button how many it takes. */
  readonly count: number;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant='outline' size='sm' onClick={() => setOpen(true)}>
        <CheckCheck />
        {t('knowledge.approveAll.open')}
        <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
          {count}
        </span>
      </Button>
      {open && (
        <ApproveAllContent
          scope={scope}
          kind={kind}
          onDone={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
}

function ApproveAllContent({
  scope,
  kind,
  onDone,
}: {
  readonly scope: InProject;
  readonly kind: KnowledgeKindDto | null;
  readonly onDone: () => void;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [error, setError] = useState<string | null>(null);
  const { data, error: loadError } = useKnowledgeItemsQuery({
    ...scope,
    filter: {
      statuses: [KnowledgeStatusDtoSchema.enum.draft],
      take: KNOWLEDGE_LIST_SIZE,
    },
  });
  const [approve, { isLoading: approving }] =
    useApproveKnowledgeItemsMutation();
  const drafts = data?.items ?? [];
  const chosen = kind ? drafts.filter(item => item.kind === kind) : drafts;
  const plan = data ? planBulkApproval(chosen, drafts) : null;
  const failedLoad = toApiError(loadError);
  const chosenKeys = new Set(chosen.map(item => item.key));
  const groups = plan ? byKind(plan.approved) : [];

  const confirm = async () => {
    if (!plan) return;
    setError(null);
    const result = await approve({ ...scope, body: { items: plan.items } });
    const failure = toApiError(result.error);
    if (failure) {
      setError(describeError(failure).text);
      return;
    }
    onDone();
  };

  return (
    <DialogContent showCloseButton={false} className='gap-0 p-0 sm:max-w-lg'>
      <DialogHeader className='gap-1 px-5 pt-5 pb-4'>
        <DialogTitle className='text-base leading-6 font-semibold tracking-[-0.01em]'>
          {plan && plan.items.length > 0
            ? t('knowledge.approveAll.titleCount', {
                count: plan.items.length,
              })
            : t('knowledge.approveAll.title')}
        </DialogTitle>
        <DialogDescription className='text-pretty'>
          {t('knowledge.approveAll.description')}
        </DialogDescription>
      </DialogHeader>
      {(failedLoad ?? error) && (
        <Alert variant='destructive' className='mx-5 mb-4 w-auto'>
          <AlertDescription>
            {failedLoad ? describeError(failedLoad).text : error}
          </AlertDescription>
        </Alert>
      )}
      {!failedLoad && (
        <div className='max-h-[min(34rem,60vh)] overflow-y-auto overscroll-contain border-t border-border pb-3'>
          {!plan && <PlanSkeleton />}
          {plan && plan.blocked.length > 0 && (
            <section>
              <GroupTitle count={plan.blocked.length}>
                <TriangleAlert aria-hidden className='size-3.5 text-warning' />
                {t('knowledge.approveAll.blocked')}
              </GroupTitle>
              <ul className={LINES}>
                {plan.blocked.map(({ item, reason, on }) => {
                  const Icon = BLOCK_ICONS[reason];

                  return (
                    <li key={item.key} className={`${LINE} px-5 py-1.5`}>
                      <Key item={item} />
                      <span className='min-w-0'>
                        <span className='block truncate text-sm text-muted-foreground'>
                          {item.title}
                        </span>
                        <span className='mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
                          <Icon
                            aria-hidden
                            className={
                              reason === BULK_APPROVAL_BLOCKS.needsReview
                                ? 'size-3 text-warning'
                                : 'size-3'
                            }
                          />
                          {t(`knowledge.approveAll.reasons.${reason}`)}
                          {on && <span className='font-mono'>{on}</span>}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {groups.map(([group, items]) => (
            <section key={group}>
              <GroupTitle count={items.length}>
                <KindIcon kind={group} />
                {t(`kinds.${group}`)}
              </GroupTitle>
              <ul className={LINES}>
                {items.map(item => (
                  <li key={item.key} className={`${LINE} px-5 py-1.5`}>
                    <Key item={item} />
                    <span className='truncate text-sm'>{item.title}</span>
                    {!chosenKeys.has(item.key) && <DependencyMark />}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {plan && plan.approved.length === 0 && plan.blocked.length === 0 && (
            <p className='px-5 pt-4 text-sm text-muted-foreground'>
              {t('knowledge.approveAll.nothing')}
            </p>
          )}
          {data && data.total > drafts.length && (
            <p className='px-5 pt-3 text-xs text-muted-foreground'>
              {t('knowledge.approveAll.firstOnly', { count: drafts.length })}
            </p>
          )}
        </div>
      )}
      <DialogFooter className='m-0 px-5 py-3.5'>
        <DialogClose render={<Button variant='outline' />}>
          {t('common.cancel')}
        </DialogClose>
        <Button
          disabled={!plan || plan.items.length === 0 || approving}
          onClick={() => void confirm()}
        >
          {approving ? <Spinner /> : <CheckCheck />}
          {t('knowledge.approveAll.confirm', {
            count: plan?.items.length ?? 0,
          })}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/** The Drafts by Kind, in the model's order of Kinds, each Kind by Knowledge Key. */
function byKind(
  items: readonly KnowledgeItemDto[],
): [KnowledgeKindDto, KnowledgeItemDto[]][] {
  return KnowledgeKindDtoSchema.options
    .map(
      kind =>
        [
          kind,
          items
            .filter(item => item.kind === kind)
            .toSorted((a, b) =>
              a.key.localeCompare(b.key, undefined, { numeric: true }),
            ),
        ] as [KnowledgeKindDto, KnowledgeItemDto[]],
    )
    .filter(([, group]) => group.length > 0);
}

/** A group's heading, held at the top of the list while its rows scroll under it. */
function GroupTitle({
  count,
  children,
}: {
  readonly count: number;
  readonly children: ReactNode;
}) {
  return (
    <h3 className='sticky top-0 z-10 flex items-center gap-2 bg-popover px-5 pt-4 pb-1.5 text-sm font-medium text-muted-foreground'>
      {children}
      <span className='font-mono text-xs font-normal tabular-nums'>
        {count}
      </span>
    </h3>
  );
}

function Key({ item }: { readonly item: KnowledgeItemDto }) {
  return (
    <span className='truncate font-mono text-xs text-muted-foreground tabular-nums'>
      {item.key}
    </span>
  );
}

/** A Draft that comes along only because a chosen one depends on it. */
function DependencyMark() {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className='flex items-center gap-1 text-xs text-muted-foreground' />
        }
      >
        <Link2 aria-hidden className='size-3' />
        {t('knowledge.approveAll.dependency')}
      </TooltipTrigger>
      <TooltipContent>
        {t('knowledge.approveAll.dependencyHint')}
      </TooltipContent>
    </Tooltip>
  );
}

/** Rows the shape of the list while the Drafts load, so the dialog keeps its size. */
function PlanSkeleton() {
  return (
    <div aria-hidden className='flex flex-col gap-3 px-5 pt-4'>
      <Skeleton className='h-4 w-28' />
      {[62, 48, 70, 54, 40, 66].map(width => (
        <div key={width} className='flex items-center gap-2'>
          <Skeleton className='h-3.5 w-10 shrink-0' />
          <Skeleton className='h-3.5' style={{ width: `${width}%` }} />
        </div>
      ))}
    </div>
  );
}
