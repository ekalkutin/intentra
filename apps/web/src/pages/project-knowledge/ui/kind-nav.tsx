import {
  CircleCheck,
  CircleDashed,
  CircleSlash,
  CircleX,
  Library,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KindIcon,
  KNOWLEDGE_VIEWS,
  type KnowledgeView,
} from '@/entities/knowledge-item';
import { cn } from '@/shared/lib';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

/** Stands for "every Kind" in the Kind select, which needs a value. */
const ALL_KINDS = 'all';

const ITEM =
  'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm outline-none transition-colors hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring/50';

function NavEntry({
  active,
  muted,
  icon,
  label,
  count,
  onClick,
}: {
  readonly active: boolean;
  readonly muted: boolean;
  readonly icon: ReactNode;
  readonly label: string;
  readonly count: number | undefined;
  readonly onClick: () => void;
}) {
  return (
    <li>
      <button
        type='button'
        aria-current={active ? 'true' : undefined}
        onClick={onClick}
        className={cn(
          ITEM,
          active
            ? 'bg-accent font-medium text-foreground'
            : muted
              ? 'text-muted-foreground'
              : 'text-foreground/80',
        )}
      >
        {icon}
        <span className='min-w-0 flex-1 truncate'>{label}</span>
        {count !== undefined && count > 0 && (
          <span className='font-mono text-xs text-muted-foreground tabular-nums'>
            {count}
          </span>
        )}
      </button>
    </li>
  );
}

function NavGroup({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <h2 className='px-2 text-xs text-muted-foreground'>{label}</h2>
      <ul className='flex flex-col gap-0.5'>{children}</ul>
    </div>
  );
}

/** The Kinds, each with how many items the current status holds. */
export function KindNav({
  kind,
  counts,
  total,
  onChoose,
}: {
  readonly kind: KnowledgeKindDto | null;
  readonly counts: Partial<Record<KnowledgeKindDto, number>>;
  readonly total: number | undefined;
  readonly onChoose: (kind: KnowledgeKindDto | null) => void;
}) {
  const { t } = useTranslation();

  return (
    <NavGroup label={t('knowledge.kindsNav')}>
      <NavEntry
        active={kind === null}
        muted={false}
        icon={
          <Library aria-hidden className='size-3.5 text-muted-foreground' />
        }
        label={t('knowledge.allKinds')}
        count={total}
        onClick={() => onChoose(null)}
      />
      {KnowledgeKindDtoSchema.options.map(option => (
        <NavEntry
          key={option}
          active={kind === option}
          muted={!counts[option]}
          icon={<KindIcon kind={option} />}
          label={t(`kinds.${option}`)}
          count={counts[option]}
          onClick={() => onChoose(option)}
        />
      ))}
    </NavGroup>
  );
}

/** Each status view's icon, the same as the status it shows. */
const VIEW_ICONS = {
  current: { icon: CircleCheck, tone: 'text-muted-foreground' },
  drafts: { icon: CircleDashed, tone: 'text-muted-foreground' },
  review: { icon: TriangleAlert, tone: 'text-warning' },
  rejected: { icon: CircleX, tone: 'text-destructive' },
  obsolete: { icon: CircleSlash, tone: 'text-muted-foreground' },
} as const satisfies Record<KnowledgeView, { icon: LucideIcon; tone: string }>;

/** Which part of the knowledge to show, by status, under the Kinds. */
export function ViewNav({
  view,
  counts,
  onChoose,
}: {
  readonly view: KnowledgeView;
  readonly counts: Partial<Record<KnowledgeView, number>>;
  readonly onChoose: (view: KnowledgeView) => void;
}) {
  const { t } = useTranslation();

  return (
    <NavGroup label={t('knowledge.viewsLabel')}>
      {Object.values(KNOWLEDGE_VIEWS).map(option => {
        const { icon: Icon, tone } = VIEW_ICONS[option];
        return (
          <NavEntry
            key={option}
            active={view === option}
            muted={false}
            icon={<Icon aria-hidden className={cn('size-3.5', tone)} />}
            label={t(`knowledge.views.${option}`)}
            count={counts[option]}
            onClick={() => onChoose(option)}
          />
        );
      })}
    </NavGroup>
  );
}

/** The same choice of Kind as a select, where there is no room for the list. */
export function KindSelect({
  kind,
  onChoose,
  className,
}: {
  readonly kind: KnowledgeKindDto | null;
  readonly onChoose: (kind: KnowledgeKindDto | null) => void;
  readonly className?: string;
}) {
  const { t } = useTranslation();
  const kinds = [
    { value: ALL_KINDS, label: t('knowledge.allKinds') },
    ...KnowledgeKindDtoSchema.options.map(option => ({
      value: option,
      label: t(`kinds.${option}`),
    })),
  ];

  return (
    <div className={className}>
      <Select
        items={kinds}
        value={kind ?? ALL_KINDS}
        onValueChange={value => {
          const parsed = KnowledgeKindDtoSchema.safeParse(value);
          onChoose(parsed.success ? parsed.data : null);
        }}
      >
        <SelectTrigger className='w-full' aria-label={t('knowledge.kindLabel')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {kinds.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
