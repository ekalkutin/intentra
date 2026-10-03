import {
  BookOpen,
  CircleHelp,
  Compass,
  Gavel,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Lock,
  Plug,
  Route,
  Target,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib';
import type { KnowledgeKindDto } from '@intentra/contracts/workspace';

/** Each Kind's icon. */
export const KIND_ICONS = {
  'product-overview': Compass,
  goal: Target,
  persona: UserRound,
  feature: LayoutGrid,
  scenario: Route,
  requirement: ListChecks,
  constraint: Lock,
  term: BookOpen,
  'business-rule': Gavel,
  integration: Plug,
  decision: Lightbulb,
  'open-question': CircleHelp,
} as const satisfies Record<KnowledgeKindDto, LucideIcon>;

/** Each Kind's muted tone, for its icon only (written out whole for Tailwind). */
const KIND_TONES = {
  'product-overview': 'text-kind-product-overview',
  goal: 'text-kind-goal',
  persona: 'text-kind-persona',
  feature: 'text-kind-feature',
  scenario: 'text-kind-scenario',
  requirement: 'text-kind-requirement',
  constraint: 'text-kind-constraint',
  term: 'text-kind-term',
  'business-rule': 'text-kind-business-rule',
  integration: 'text-kind-integration',
  decision: 'text-kind-decision',
  'open-question': 'text-kind-open-question',
} as const satisfies Record<KnowledgeKindDto, string>;

/** A Kind's icon in its tone. */
export function KindIcon({
  kind,
  className,
}: {
  readonly kind: KnowledgeKindDto;
  readonly className?: string;
}) {
  const Icon = KIND_ICONS[kind];

  return (
    <Icon aria-hidden className={cn('size-3.5', KIND_TONES[kind], className)} />
  );
}

/** A Kind as its icon and its name. */
export function KindBadge({
  kind,
  className,
}: {
  readonly kind: KnowledgeKindDto;
  readonly className?: string;
}) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground',
        className,
      )}
    >
      <KindIcon kind={kind} />
      {t(`kindsOne.${kind}`)}
    </span>
  );
}
