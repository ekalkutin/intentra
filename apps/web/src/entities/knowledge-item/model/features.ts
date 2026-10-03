import {
  KnowledgeKindDtoSchema,
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
  type KnowledgeLinkDto,
} from '@intentra/contracts/workspace';

const PART_OF = KnowledgeLinkTypeDtoSchema.enum['part-of'];
const KIND = KnowledgeKindDtoSchema.enum;
const { draft, approved } = KnowledgeStatusDtoSchema.enum;

/** The Kinds that can be part of a Feature, in the model's order. */
const PART_KINDS: readonly KnowledgeKindDto[] = [
  KIND.scenario,
  KIND.requirement,
  KIND['business-rule'],
];

export function canBePart(kind: KnowledgeKindDto): boolean {
  return PART_KINDS.includes(kind);
}

/** The Knowledge Key of the Feature an item is part of, if any. */
export function featureOf(
  item: Pick<KnowledgeItemDto, 'links'>,
): string | null {
  return item.links.find(link => link.type === PART_OF)?.key ?? null;
}

/**
 * The current items (Drafts and Approved) that are part of a Feature, by
 * Kind in the model's order, then by their Knowledge Key's number.
 */
export function partsOf(
  featureKey: string,
  items: readonly KnowledgeItemDto[],
): KnowledgeItemDto[] {
  return items
    .filter(
      item =>
        (item.status === draft || item.status === approved) &&
        featureOf(item) === featureKey,
    )
    .sort(
      (a, b) =>
        PART_KINDS.indexOf(a.kind) - PART_KINDS.indexOf(b.kind) ||
        numberOf(a.key) - numberOf(b.key),
    );
}

/** An item's Links with its Feature set to another, or taken away (`null`). */
export function withFeature(
  links: readonly KnowledgeLinkDto[],
  featureKey: string | null,
): KnowledgeLinkDto[] {
  return [
    ...links.filter(link => link.type !== PART_OF),
    ...(featureKey ? [{ type: PART_OF, key: featureKey }] : []),
  ];
}

function numberOf(key: string): number {
  return Number(key.slice(key.lastIndexOf('-') + 1));
}
