import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  KindIcon,
  partsOf,
  useKnowledgeScope,
  type InProject,
  type KnowledgeIndex,
} from '@/entities/knowledge-item';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  InlineMarkdown,
  List,
  LIST_ROW_LINK_CLASS,
  ListRow,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';
import {
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import {
  canMovePart,
  partCandidates,
  type PartCandidate,
} from '../model/feature-parts';
import { useMoveParts } from '../model/use-move-parts';

const { approved } = KnowledgeStatusDtoSchema.enum;

/**
 * What a Feature holds: its Scenarios, Requirements and Business Rules, each
 * opening its item; where the Member may, each can be taken out, and more put
 * in from a searchable list. An Approved item moves without a replacement and
 * keeps its Knowledge Key; a Draft moves by an edit of its Links.
 */
export function FeatureParts({
  feature,
  index,
  scope,
}: {
  readonly feature: KnowledgeItemDto;
  readonly index: KnowledgeIndex;
  readonly scope: InProject;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [move, moving] = useMoveParts(scope);
  const [failure, setFailure] = useState<string | null>(null);
  const parts = partsOf(feature.key, index.items);
  const candidates = partCandidates(feature, index.items);

  const run = async (
    items: readonly KnowledgeItemDto[],
    featureKey: string | null,
  ): Promise<boolean> => {
    const error = await move(items, featureKey);
    setFailure(error && describeError(error).text);
    return error === null;
  };

  return (
    <section
      aria-labelledby='feature-parts-title'
      className='flex flex-col gap-3'
    >
      <header className='flex min-h-8 items-center justify-between gap-4'>
        <h2
          id='feature-parts-title'
          className='flex items-center gap-2 text-sm font-semibold'
        >
          {t('featureParts.title')}
          {parts.length > 0 && (
            <span className='font-mono text-xs font-normal text-muted-foreground tabular-nums'>
              {parts.length}
            </span>
          )}
        </h2>
        {candidates.length > 0 && (
          <PartsPicker
            candidates={candidates}
            pending={moving}
            onAdd={items => run(items, feature.key)}
          />
        )}
      </header>
      {failure && (
        <Alert variant='destructive'>
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      )}
      {parts.length === 0 ? (
        <p className='max-w-2xl text-sm text-pretty text-muted-foreground'>
          {t('featureParts.empty')}
        </p>
      ) : (
        <List>
          {parts.map(part => (
            <PartRow
              key={part.key}
              part={part}
              pending={moving}
              onRemove={
                canMovePart(part) ? () => void run([part], null) : undefined
              }
            />
          ))}
        </List>
      )}
    </section>
  );
}

/** One part: its Kind, key, title and statement; it opens the item. */
function PartRow({
  part,
  pending,
  onRemove,
}: {
  readonly part: KnowledgeItemDto;
  readonly pending: boolean;
  /** Takes it out of the Feature; none when the Member may not. */
  readonly onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const scope = useKnowledgeScope();
  const label = t('featureParts.remove', { key: part.key });

  return (
    <ListRow
      interactive
      lead={part.key}
      meta={
        part.needsReview ? (
          <span className='text-warning'>{t('knowledge.needsReview')}</span>
        ) : part.status === approved ? undefined : (
          t(`statuses.${part.status}`)
        )
      }
      actions={
        onRemove && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant='ghost'
                  size='icon-sm'
                  aria-label={label}
                  disabled={pending}
                  onClick={onRemove}
                  // Above the row's link, which covers the whole row.
                  className='relative z-10 text-muted-foreground hover:text-foreground'
                />
              }
            >
              <X />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        )
      }
    >
      <div className='flex min-w-0 items-center gap-2'>
        <KindIcon kind={part.kind} className='shrink-0' />
        <Link
          to={scope.itemPath(part.key)}
          className={`${LIST_ROW_LINK_CLASS} min-w-0 truncate text-sm font-medium`}
        >
          {part.title}
        </Link>
      </div>
      {part.mainField && (
        <InlineMarkdown className='mt-0.5 line-clamp-1 pl-5.5 text-sm text-muted-foreground'>
          {part.mainField}
        </InlineMarkdown>
      )}
    </ListRow>
  );
}

/**
 * Picks items to put into the Feature from a searchable list, by Kind; one
 * of another Feature says it moves, an Approved one waits while the Feature
 * is a Draft. "Добавить" puts every picked one in at once.
 */
function PartsPicker({
  candidates,
  pending,
  onAdd,
}: {
  readonly candidates: readonly PartCandidate[];
  readonly pending: boolean;
  /** Resolves true once they are in. */
  readonly onAdd: (items: readonly KnowledgeItemDto[]) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<readonly string[]>([]);
  const kinds = [...new Set(candidates.map(({ item }) => item.kind))];
  const toggle = (key: string) =>
    setPicked(current =>
      current.includes(key)
        ? current.filter(other => other !== key)
        : [...current, key],
    );
  const chosen = candidates
    .filter(({ item }) => picked.includes(item.key))
    .map(({ item }) => item);
  const moving = candidates.filter(
    ({ item, from }) => from !== null && picked.includes(item.key),
  ).length;

  const change = (next: boolean) => {
    if (!next) {
      setPicked([]);
    }
    setOpen(next);
  };
  const add = async () => {
    if (await onAdd(chosen)) {
      change(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={change}>
      <PopoverTrigger render={<Button variant='outline' size='sm' />}>
        <Plus />
        {t('featureParts.add')}
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-[min(26rem,calc(100vw-2rem))] p-0'
      >
        <Command>
          <CommandInput placeholder={t('featureParts.search')} />
          <CommandList className='max-h-[min(50vh,24rem)]'>
            <CommandEmpty>{t('featureParts.nothingFound')}</CommandEmpty>
            {kinds.map(kind => (
              <CommandGroup key={kind} heading={t(`kinds.${kind}`)}>
                {candidates
                  .filter(({ item }) => item.kind === kind)
                  .map(candidate => (
                    <CandidateItem
                      key={candidate.item.key}
                      candidate={candidate}
                      kind={kind}
                      checked={picked.includes(candidate.item.key)}
                      onToggle={() => toggle(candidate.item.key)}
                    />
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        <div className='flex items-center justify-between gap-3 border-t border-border p-1.5 pl-3'>
          <span className='min-w-0 text-xs text-pretty text-muted-foreground'>
            {moving > 0 && t('featureParts.moving', { count: moving })}
          </span>
          <Button
            size='sm'
            disabled={chosen.length === 0 || pending}
            onClick={() => void add()}
          >
            {pending && <Spinner />}
            {chosen.length > 0
              ? t('featureParts.addCount', { count: chosen.length })
              : t('featureParts.add')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CandidateItem({
  candidate: { item, from, block },
  kind,
  checked,
  onToggle,
}: {
  readonly candidate: PartCandidate;
  readonly kind: KnowledgeKindDto;
  readonly checked: boolean;
  readonly onToggle: () => void;
}) {
  const { t } = useTranslation();
  const hint = block
    ? t(`featureParts.blocks.${block}`)
    : from
      ? t('featureParts.from', { key: from })
      : item.status === approved
        ? null
        : t(`statuses.${item.status}`);

  return (
    <CommandItem
      value={`${item.key} ${item.title}`}
      disabled={block !== null}
      data-checked={checked}
      aria-checked={checked}
      onSelect={onToggle}
      className='items-start'
    >
      <KindIcon kind={kind} className='mt-0.5' />
      <span className='flex min-w-0 flex-col gap-0.5'>
        <span className='flex min-w-0 items-baseline gap-2'>
          <span className='shrink-0 font-mono text-xs text-muted-foreground'>
            {item.key}
          </span>
          <span className='truncate'>{item.title}</span>
        </span>
        {hint && <span className='text-xs text-muted-foreground'>{hint}</span>}
      </span>
    </CommandItem>
  );
}
