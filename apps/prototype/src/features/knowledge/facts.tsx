import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  ListChecks,
  ListOrdered,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { enumLabel, KIND_BY_ID } from './kinds';

/** One short, scannable fact about a Knowledge Item, such as its priority. */
export type Fact = {
  readonly label: string;
  readonly value: ReactNode;
  readonly tone?: string;
  readonly icon?: ReactNode;
};

const PRIORITY_TONE: Record<string, string> = {
  must: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  should:
    'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  could: 'border-border bg-muted text-muted-foreground',
};

const SHORT: Record<string, string> = {
  functional: 'Функциональное',
  'non-functional': 'Нефункциональное',
  must: 'Must',
  should: 'Should',
  could: 'Could',
  outbound: 'Исходящая',
  inbound: 'Входящая',
  both: 'Двусторонняя',
};

const DIRECTION_ICON: Record<string, ReactNode> = {
  outbound: <ArrowUpRight className='size-3' />,
  inbound: <ArrowDownLeft className='size-3' />,
  both: <ArrowLeftRight className='size-3' />,
};

const short = (value: string) => SHORT[value] ?? enumLabel(value);

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? one
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? few
        : many;
  return `${n} ${word}`;
}

/** The facts worth seeing in a list for each Kind; gaps are left out. */
export function factsOf(item: KnowledgeItemDto): Fact[] {
  const facts: Fact[] = [];
  const push = (fact: Fact | false | '' | null | undefined) => {
    if (fact) facts.push(fact);
  };

  switch (item.kind) {
    case 'requirement': {
      const f = item.fields;
      push(f.type && { label: 'Тип', value: short(f.type) });
      push(
        f.priority && {
          label: 'Приоритет',
          value: short(f.priority),
          tone: PRIORITY_TONE[f.priority],
        },
      );
      push(
        f.acceptanceCriteria.length > 0 && {
          label: 'Критерии приёмки',
          value: plural(
            f.acceptanceCriteria.length,
            'критерий',
            'критерия',
            'критериев',
          ),
          icon: <ListChecks className='size-3' />,
        },
      );
      break;
    }
    case 'persona':
      push(
        item.fields.type && { label: 'Тип', value: short(item.fields.type) },
      );
      push(
        item.fields.needs.length > 0 && {
          label: 'Потребности',
          value: plural(
            item.fields.needs.length,
            'потребность',
            'потребности',
            'потребностей',
          ),
        },
      );
      break;
    case 'scenario':
      push(
        item.fields.steps.length > 0 && {
          label: 'Шаги',
          value: plural(item.fields.steps.length, 'шаг', 'шага', 'шагов'),
          icon: <ListOrdered className='size-3' />,
        },
      );
      break;
    case 'constraint':
      push(
        item.fields.imposedBy && {
          label: 'Источник',
          value: short(item.fields.imposedBy),
        },
      );
      break;
    case 'term':
      push(
        item.fields.sort && { label: 'Вид', value: short(item.fields.sort) },
      );
      push(
        item.fields.synonymsToAvoid.length > 0 && {
          label: 'Избегаем',
          value: item.fields.synonymsToAvoid.join(', '),
        },
      );
      break;
    case 'integration':
      push(
        item.fields.externalSystem && {
          label: 'Система',
          value: item.fields.externalSystem,
        },
      );
      push(
        item.fields.direction && {
          label: 'Направление',
          value: short(item.fields.direction),
          icon: DIRECTION_ICON[item.fields.direction],
        },
      );
      break;
    case 'decision':
      push(
        item.fields.area && {
          label: 'Область',
          value: short(item.fields.area),
        },
      );
      push(
        item.fields.rejectedAlternatives.length > 0 && {
          label: 'Отвергнуто',
          value: plural(
            item.fields.rejectedAlternatives.length,
            'вариант',
            'варианта',
            'вариантов',
          ),
        },
      );
      break;
    case 'goal':
      push(
        item.fields.successMetric && {
          label: 'Метрика',
          value: item.fields.successMetric,
        },
      );
      break;
    case 'open-question':
      push(
        item.answeredBy.length > 0
          ? {
              label: 'Статус вопроса',
              value: `Есть ответ: ${item.answeredBy.join(', ')}`,
              tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
              icon: <CheckCircle2 className='size-3' />,
            }
          : {
              label: 'Статус вопроса',
              value: 'Открыт',
              icon: <CircleDashed className='size-3' />,
            },
      );
      break;
    case 'product-overview':
    case 'business-rule':
      break;
  }
  return facts;
}

export function FactChip({ fact }: { fact: Fact }) {
  return (
    <span
      title={fact.label}
      className={cn(
        'inline-flex h-5 max-w-56 items-center gap-1 truncate rounded-md border px-1.5 text-[11px] font-medium',
        fact.tone ?? 'border-border bg-background text-muted-foreground',
      )}
    >
      {fact.icon}
      <span className='truncate'>{fact.value}</span>
    </span>
  );
}

export function Facts({
  item,
  className,
}: {
  item: KnowledgeItemDto;
  className?: string;
}) {
  const facts = factsOf(item);
  if (!facts.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {facts.map(fact => (
        <FactChip key={fact.label} fact={fact} />
      ))}
    </div>
  );
}

/**
 * Columns for a table of one Kind: its enum fields and list sizes, so that,
 * say, Requirements show their type and priority side by side.
 */
export function kindColumns(kind: KnowledgeItemDto['kind']): {
  name: string;
  label: string;
  render: (item: KnowledgeItemDto) => ReactNode;
}[] {
  const empty = <span className='text-muted-foreground/60'>—</span>;
  return KIND_BY_ID[kind].fields
    .filter(field => field.type !== 'text' || field.name === 'externalSystem')
    .map(field => ({
      name: field.name,
      label: field.label,
      render: (item: KnowledgeItemDto) => {
        const value = (item.fields as Record<string, unknown>)[field.name];
        if (value === null || value === undefined || value === '') return empty;
        if (Array.isArray(value)) {
          return value.length ? (
            <span className='tabular-nums'>{value.length}</span>
          ) : (
            empty
          );
        }
        if (field.type === 'enum') {
          const tone =
            field.name === 'priority'
              ? PRIORITY_TONE[value as string]
              : undefined;
          return (
            <FactChip
              fact={{
                label: field.label,
                value: short(value as string),
                tone,
                icon:
                  field.name === 'direction'
                    ? DIRECTION_ICON[value as string]
                    : undefined,
              }}
            />
          );
        }
        return <span className='text-sm'>{String(value)}</span>;
      },
    }));
}
