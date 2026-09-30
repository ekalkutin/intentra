import {
  BookOpen,
  CircleHelp,
  Compass,
  Gavel,
  Lightbulb,
  ListChecks,
  Lock,
  Plug,
  Route,
  Target,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import type {
  KnowledgeFieldsDtoByKind,
  KnowledgeKindDto,
  KnowledgeLinkTypeDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

/** How one field of a Kind is edited and shown. */
export type FieldSpec =
  | { name: string; label: string; type: 'text'; main?: boolean; hint?: string }
  | { name: string; label: string; type: 'enum'; options: readonly string[] }
  | {
      name: string;
      label: string;
      type: 'list';
      itemLabel: string;
      addLabel: string;
    }
  | { name: string; label: string; type: 'alternatives' };

export type KindSpec = {
  readonly kind: KnowledgeKindDto;
  readonly label: string;
  readonly plural: string;
  readonly prefix: string;
  readonly icon: LucideIcon;
  /** Tailwind classes for the Kind's chip. */
  readonly tone: string;
  readonly description: string;
  readonly fields: readonly FieldSpec[];
};

const text = (name: string, label: string, main = false, hint?: string) =>
  ({ name, label, type: 'text', main, hint }) as const;

const list = (
  name: string,
  label: string,
  itemLabel: string,
  addLabel: string,
) => ({ name, label, type: 'list', itemLabel, addLabel }) as const;

export const KINDS: readonly KindSpec[] = [
  {
    kind: 'product-overview',
    label: 'Обзор продукта',
    plural: 'Обзор продукта',
    prefix: 'PO',
    icon: Compass,
    tone: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    description:
      'Что это за продукт и для кого. В проекте одно утверждённое описание.',
    fields: [
      text('summary', 'Кратко', true, 'Что это за продукт и для кого.'),
      text('problem', 'Проблема'),
      text('audience', 'Аудитория'),
      text('value', 'Ценность'),
    ],
  },
  {
    kind: 'goal',
    label: 'Цель',
    plural: 'Цели',
    prefix: 'GOAL',
    icon: Target,
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    description: 'Чего проект хочет достичь.',
    fields: [
      text('outcome', 'Результат', true),
      text('successMetric', 'Метрика успеха'),
    ],
  },
  {
    kind: 'persona',
    label: 'Персона',
    plural: 'Персоны',
    prefix: 'PER',
    icon: UserRound,
    tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    description: 'Кто пользуется продуктом: человек или система.',
    fields: [
      text('profile', 'Профиль', true, 'Кто это.'),
      {
        name: 'type',
        label: 'Тип',
        type: 'enum',
        options: ['person', 'system'],
      },
      list('needs', 'Потребности', 'Потребность', 'Добавить потребность'),
    ],
  },
  {
    kind: 'scenario',
    label: 'Сценарий',
    plural: 'Сценарии',
    prefix: 'SC',
    icon: Route,
    tone: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    description:
      'Что делает исполнитель и что получает. Персону свяжите через «зависит от».',
    fields: [
      text('expectedResult', 'Ожидаемый результат', true),
      list('steps', 'Шаги', 'Шаг', 'Добавить шаг'),
    ],
  },
  {
    kind: 'requirement',
    label: 'Требование',
    plural: 'Требования',
    prefix: 'REQ',
    icon: ListChecks,
    tone: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    description: 'Что система делает или каким качеством обладает.',
    fields: [
      text('statement', 'Формулировка', true),
      {
        name: 'type',
        label: 'Тип',
        type: 'enum',
        options: ['functional', 'non-functional'],
      },
      {
        name: 'priority',
        label: 'Приоритет',
        type: 'enum',
        options: ['must', 'should', 'could'],
      },
      list(
        'acceptanceCriteria',
        'Критерии приёмки',
        'Критерий',
        'Добавить критерий',
      ),
    ],
  },
  {
    kind: 'constraint',
    label: 'Ограничение',
    plural: 'Ограничения',
    prefix: 'CON',
    icon: Lock,
    tone: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    description: 'Наложено извне и не обсуждается.',
    fields: [
      text('constraint', 'Ограничение', true),
      {
        name: 'imposedBy',
        label: 'Источник',
        type: 'enum',
        options: [
          'law',
          'budget',
          'deadline',
          'customer',
          'company',
          'infrastructure',
        ],
      },
    ],
  },
  {
    kind: 'term',
    label: 'Термин',
    plural: 'Глоссарий',
    prefix: 'TERM',
    icon: BookOpen,
    tone: 'bg-stone-500/10 text-stone-700 dark:text-stone-300',
    description: 'Слово и что оно значит в этом проекте.',
    fields: [
      text('definition', 'Определение', true),
      {
        name: 'sort',
        label: 'Вид понятия',
        type: 'enum',
        options: ['entity', 'value', 'role', 'action-event', 'other'],
      },
      list(
        'synonymsToAvoid',
        'Синонимы, которых избегаем',
        'Синоним',
        'Добавить синоним',
      ),
    ],
  },
  {
    kind: 'business-rule',
    label: 'Бизнес-правило',
    plural: 'Бизнес-правила',
    prefix: 'BR',
    icon: Gavel,
    tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    description: 'Правило бизнеса одним предложением.',
    fields: [text('rule', 'Правило', true)],
  },
  {
    kind: 'integration',
    label: 'Интеграция',
    plural: 'Интеграции',
    prefix: 'INT',
    icon: Plug,
    tone: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    description: 'Обмен с внешней системой.',
    fields: [
      text('purpose', 'Назначение', true),
      text('externalSystem', 'Внешняя система'),
      {
        name: 'direction',
        label: 'Направление',
        type: 'enum',
        options: ['outbound', 'inbound', 'both'],
      },
      text('exchanged', 'Чем обмениваемся'),
    ],
  },
  {
    kind: 'decision',
    label: 'Решение',
    plural: 'Решения',
    prefix: 'DEC',
    icon: Lightbulb,
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    description: 'Что выбрал проект и почему.',
    fields: [
      text('decision', 'Решение', true),
      {
        name: 'area',
        label: 'Область',
        type: 'enum',
        options: ['architecture', 'product', 'business'],
      },
      text('context', 'Контекст'),
      {
        name: 'rejectedAlternatives',
        label: 'Отвергнутые варианты',
        type: 'alternatives',
      },
    ],
  },
  {
    kind: 'open-question',
    label: 'Открытый вопрос',
    plural: 'Открытые вопросы',
    prefix: 'TBD',
    icon: CircleHelp,
    tone: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
    description: 'Что в проекте ещё не решено.',
    fields: [text('question', 'Вопрос', true)],
  },
];

export const KIND_BY_ID = Object.fromEntries(
  KINDS.map(spec => [spec.kind, spec]),
) as Record<KnowledgeKindDto, KindSpec>;

export function kindOfKey(key: string): KindSpec | undefined {
  const prefix = key.replace(/-\d+$/, '');
  return KINDS.find(spec => spec.prefix === prefix);
}

/** Empty fields for a Kind, as the API expects them. */
export function emptyFields<K extends KnowledgeKindDto>(
  kind: K,
): KnowledgeFieldsDtoByKind[K] {
  const fields: Record<string, unknown> = {};
  for (const field of KIND_BY_ID[kind].fields) {
    fields[field.name] =
      field.type === 'list' || field.type === 'alternatives'
        ? []
        : field.type === 'text' && field.main
          ? ''
          : null;
  }
  return fields as KnowledgeFieldsDtoByKind[K];
}

export const STATUSES: readonly {
  status: KnowledgeStatusDto;
  label: string;
  tone: string;
}[] = [
  {
    status: 'draft',
    label: 'Черновик',
    tone: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  },
  {
    status: 'approved',
    label: 'Утверждено',
    tone: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  },
  {
    status: 'rejected',
    label: 'Отклонено',
    tone: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30',
  },
  {
    status: 'obsolete',
    label: 'Устарело',
    tone: 'bg-muted text-muted-foreground border-border line-through',
  },
];

export const STATUS_BY_ID = Object.fromEntries(
  STATUSES.map(s => [s.status, s]),
) as Record<KnowledgeStatusDto, (typeof STATUSES)[number]>;

export const LINK_TYPES: readonly {
  type: KnowledgeLinkTypeDto;
  label: string;
  /** How the link reads from its target's side. */
  incoming: string;
  hint: string;
}[] = [
  {
    type: 'depends-on',
    label: 'зависит от',
    incoming: 'От этого зависят',
    hint: 'Верно, только пока верна цель связи',
  },
  {
    type: 'uses-term',
    label: 'использует термин',
    incoming: 'Используют этот термин',
    hint: 'Опирается на термин глоссария',
  },
  {
    type: 'justified-by',
    label: 'обосновано',
    incoming: 'Обосновывает',
    hint: 'Причина — это решение',
  },
  {
    type: 'answers',
    label: 'отвечает на',
    incoming: 'Отвечают на это',
    hint: 'Закрывает открытый вопрос',
  },
  {
    type: 'conflicts-with',
    label: 'противоречит',
    incoming: 'Противоречат этому',
    hint: 'Два элемента противоречат друг другу',
  },
];

export const LINK_LABEL = Object.fromEntries(
  LINK_TYPES.map(l => [l.type, l.label]),
) as Record<KnowledgeLinkTypeDto, string>;

/** Russian labels for the values of the Kinds' enum fields. */
const ENUM_LABEL: Record<string, string> = {
  person: 'Человек',
  system: 'Система',
  functional: 'Функциональное',
  'non-functional': 'Нефункциональное',
  must: 'Обязательно (must)',
  should: 'Желательно (should)',
  could: 'Возможно (could)',
  law: 'Закон',
  budget: 'Бюджет',
  deadline: 'Срок',
  customer: 'Заказчик',
  company: 'Компания',
  infrastructure: 'Инфраструктура',
  entity: 'Сущность',
  value: 'Значение',
  role: 'Роль',
  'action-event': 'Действие или событие',
  other: 'Другое',
  outbound: 'Исходящая (мы → они)',
  inbound: 'Входящая (они → мы)',
  both: 'В обе стороны',
  architecture: 'Архитектура',
  product: 'Продукт',
  business: 'Бизнес',
};

export function enumLabel(value: string): string {
  return ENUM_LABEL[value] ?? value;
}
