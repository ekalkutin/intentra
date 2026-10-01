import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Box,
  Briefcase,
  Building2,
  CalendarClock,
  Gauge,
  Handshake,
  Hash,
  Layers,
  Package,
  Scale,
  Server,
  Shapes,
  SquareFunction,
  User,
  UserRound,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import type { KnowledgeKindDto } from '@intentra/contracts/workspace';

/**
 * The icon each choice reads with, by Kind, field and value. A Requirement's
 * priority has its own bars instead; a unit test checks that every other
 * choice the contracts allow has an icon here.
 */
const CHOICE_ICONS: Partial<
  Record<KnowledgeKindDto, Record<string, Record<string, LucideIcon>>>
> = {
  term: {
    sort: {
      entity: Box,
      value: Hash,
      role: UserRound,
      'action-event': Zap,
      other: Shapes,
    },
  },
  requirement: {
    type: {
      functional: SquareFunction,
      'non-functional': Gauge,
    },
  },
  decision: {
    area: {
      architecture: Layers,
      product: Package,
      business: Briefcase,
    },
  },
  persona: {
    type: {
      person: User,
      system: Server,
    },
  },
  constraint: {
    imposedBy: {
      law: Scale,
      budget: Wallet,
      deadline: CalendarClock,
      customer: Handshake,
      company: Building2,
      infrastructure: Server,
    },
  },
  integration: {
    direction: {
      outbound: ArrowUpRight,
      inbound: ArrowDownLeft,
      both: ArrowLeftRight,
    },
  },
};

export function choiceIconOf(
  kind: KnowledgeKindDto,
  field: string,
  value: string,
): LucideIcon | null {
  return CHOICE_ICONS[kind]?.[field]?.[value] ?? null;
}
