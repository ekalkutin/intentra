import { cn } from '@/shared/lib';
import type {
  KnowledgeKindDto,
  RequirementPriorityDto,
} from '@intentra/contracts/workspace';

import { choiceIconOf } from '../model/choice-icons';
import { useFieldTexts } from '../model/field-texts';
import { PRIORITY_LEVELS, priorityOf } from '../model/priority';

const BARS = [1, 2, 3] as const;

/** A priority as three rising bars, the filled ones telling how much it matters. */
export function PriorityIcon({
  priority,
  className,
}: {
  readonly priority: RequirementPriorityDto;
  readonly className?: string;
}) {
  const level = PRIORITY_LEVELS[priority];

  return (
    <svg
      aria-hidden
      viewBox='0 0 12 12'
      className={cn('size-3 shrink-0', className)}
    >
      {BARS.map(bar => (
        <rect
          key={bar}
          x={(bar - 1) * 4.5}
          y={12 - bar * 3.5 - 1.5}
          width='3'
          height={bar * 3.5 + 1.5}
          rx='0.75'
          className={bar <= level ? 'fill-current' : 'fill-current opacity-25'}
        />
      ))}
    </svg>
  );
}

/**
 * A Kind's choice as it reads: its word, after the bars for a Requirement's
 * priority or the icon some choices have.
 */
export function ChoiceValue({
  kind,
  field,
  value,
  className,
}: {
  readonly kind: KnowledgeKindDto;
  readonly field: string;
  readonly value: string;
  readonly className?: string;
}) {
  const texts = useFieldTexts();
  const priority = priorityOf(kind, field, value);
  const text = texts.option(kind, field, value);

  const Icon = priority ? null : choiceIconOf(kind, field, value);

  if (!priority && !Icon) {
    return <span className={className}>{text}</span>;
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {priority && <PriorityIcon priority={priority} />}
      {Icon && <Icon aria-hidden className='size-3 shrink-0' />}
      {text}
    </span>
  );
}
