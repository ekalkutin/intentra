import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KindIcon,
  KnowledgeStatusBadge,
  type GapGroup,
  type KnowledgeListState,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import { Button, List, LIST_ROW_LINK_CLASS, ListRow } from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeGapRuleDto,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

const KINDS = KnowledgeKindDtoSchema.enum;

/** The Kind a Gap of the Project as a whole is closed by recording. */
const MISSING_KIND: Partial<Record<KnowledgeGapRuleDto, KnowledgeKindDto>> = {
  'no-product-overview': KINDS['product-overview'],
  'no-persona': KINDS.persona,
  'no-goal': KINDS.goal,
};

/**
 * The Gaps, each rule under its heading with what it misses: the Project's
 * own Gaps offer to record what is missing, the others lead to their item.
 */
export function GapsView({
  groups,
  pathOf,
  newPathOf,
  canRecord,
  state,
}: {
  readonly groups: readonly GapGroup[];
  readonly pathOf: (key: string) => string;
  readonly newPathOf: (kind: KnowledgeKindDto) => string;
  readonly canRecord: readonly KnowledgeKindDto[];
  readonly state: KnowledgeListState;
}) {
  const { t } = useTranslation();

  return groups.map(({ rule, gaps }) => (
    <section
      key={rule}
      aria-labelledby={`gap-${rule}`}
      className='flex flex-col gap-1'
    >
      <h2
        id={`gap-${rule}`}
        className='flex items-center gap-2 py-2 text-sm font-semibold'
      >
        {t(`knowledge.gapRules.${rule}`)}
        <span className='font-mono font-normal text-muted-foreground tabular-nums'>
          {gaps.length}
        </span>
      </h2>
      <p className='max-w-2xl pb-2 text-sm text-pretty text-muted-foreground'>
        {t(`knowledge.gapHints.${rule}`)}
      </p>
      <List>
        {gaps.map(({ item }) => {
          if (item === null) {
            const kind = MISSING_KIND[rule];

            return (
              <ListRow
                key={rule}
                actions={
                  kind &&
                  canRecord.includes(kind) && (
                    <Button
                      variant='outline'
                      size='sm'
                      render={<Link to={newPathOf(kind)} />}
                    >
                      {t('knowledge.record')}
                    </Button>
                  )
                }
              >
                <span className='flex items-center gap-2 text-sm'>
                  {kind && <KindIcon kind={kind} />}
                  {t('knowledge.gapOfProject')}
                </span>
              </ListRow>
            );
          }

          return (
            <ListRow
              key={item.key}
              lead={item.key}
              interactive
              meta={
                item.status === KnowledgeStatusDtoSchema.enum.draft && (
                  <KnowledgeStatusBadge status={item.status} />
                )
              }
            >
              <Link
                to={pathOf(item.key)}
                state={state}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium',
                  LIST_ROW_LINK_CLASS,
                )}
              >
                <KindIcon kind={item.kind} />
                {item.title}
              </Link>
            </ListRow>
          );
        })}
      </List>
    </section>
  ));
}
