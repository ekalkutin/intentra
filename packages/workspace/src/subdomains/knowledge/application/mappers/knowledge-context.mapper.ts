import type {
  KnowledgeContextDraftDto,
  KnowledgeContextDto,
  KnowledgeContextEntryDto,
  KnowledgeContextItemDto,
  KnowledgeContextRoleDto,
  KnowledgeKindDto,
  KnowledgeLinkDto,
} from '@intentra/contracts/workspace';

import { KnowledgeItem } from '../../domain/entities/index.js';
import type { ContextPackEntry } from '../../domain/services/index.js';

/** An Approved item as an agent reads it: its content, never who did what when. */
export function toKnowledgeContextEntryDto(
  item: KnowledgeItem,
): KnowledgeContextEntryDto {
  return {
    key: item.key.value,
    // The content is always of the item's Kind, and its values are the published ones.
    kind: item.kind.value,
    fields: item.content.toFields(),
    title: item.title.value,
    mainField: item.content.mainField.value,
    rationale: item.rationale?.value ?? null,
    links: item.links.map(link => link.toProps() as KnowledgeLinkDto),
    needsReview: item.needsReview(),
    reviewCauses: item.reviewCauses.map(cause => cause.value),
  } as KnowledgeContextEntryDto;
}

export function toKnowledgeContextItemDto(
  entry: ContextPackEntry,
): KnowledgeContextItemDto {
  const role = entry.role.value as KnowledgeContextRoleDto;
  if (entry.inFull) {
    return {
      ...toKnowledgeContextEntryDto(entry.item),
      role,
      distance: entry.distance,
      detail: 'full',
    };
  }

  return {
    key: entry.item.key.value,
    kind: entry.item.kind.value as KnowledgeKindDto,
    title: entry.item.title.value,
    mainField: entry.item.content.mainField.value,
    needsReview: entry.item.needsReview(),
    role,
    distance: entry.distance,
    detail: 'brief',
  };
}

const ROLE_SECTIONS: readonly {
  readonly role: KnowledgeContextRoleDto;
  readonly heading: string;
}[] = [
  { role: 'anchor', heading: 'Anchors: the subject of this task' },
  {
    role: 'conflict',
    heading: 'Conflicts: they contradict an item of this context',
  },
  {
    role: 'unsettled',
    heading: 'Unsettled: open questions, ask the person before deciding',
  },
  {
    role: 'rule',
    heading: 'Rules: business rules on the task, the code must keep them',
  },
  { role: 'foundation', heading: 'Foundation: what the Anchors rest on' },
  {
    role: 'may-be-affected',
    heading: 'May be affected: they link to an Anchor',
  },
  { role: 'term', heading: 'Terms' },
];

/** The Context Pack as an agent reads it; English frame, the Project's own words inside. */
export function drawContextPack(
  pack: Pick<KnowledgeContextDto, 'anchors' | 'items' | 'draftsNearby'>,
): string {
  const lines = [
    `# Context for ${pack.anchors.join(', ')}`,
    '',
    'The approved knowledge of the Project for this task. Build on it as it is; where something is unsettled, in conflict or under review, ask the person. Items shown on one line are past the size of this context: read them in full by their Knowledge Key.',
  ];
  for (const { role, heading } of ROLE_SECTIONS) {
    const items = pack.items.filter(item => item.role === role);
    if (items.length === 0) continue;
    lines.push('', `## ${heading}`);
    for (const item of items.filter(item => item.detail === 'full')) {
      lines.push('', ...drawEntry(item as KnowledgeContextEntryDto));
    }
    const brief = items.filter(item => item.detail === 'brief');
    if (brief.length > 0) {
      lines.push('', ...brief.map(drawBrief));
    }
  }
  if (pack.draftsNearby.length > 0) {
    lines.push('', drawDrafts(pack.draftsNearby));
  }

  return lines.join('\n') + '\n';
}

const FRAME_SECTIONS: readonly {
  readonly kind: KnowledgeKindDto;
  readonly heading: string;
}[] = [
  { kind: 'product-overview', heading: 'Product' },
  { kind: 'constraint', heading: 'Constraints' },
  { kind: 'requirement', heading: 'Quality requirements' },
];

/** The Project Frame as an agent reads it. */
export function drawProjectFrame(
  items: readonly KnowledgeContextEntryDto[],
): string {
  const lines = [
    '# Project frame',
    '',
    'What holds for every task in this Project, whatever it links to: the product, the constraints imposed on it and the qualities it must have.',
  ];
  if (items.length === 0) {
    lines.push('', 'Nothing of it is approved yet.');
  }
  for (const { kind, heading } of FRAME_SECTIONS) {
    const ofKind = items.filter(item => item.kind === kind);
    if (ofKind.length === 0) continue;
    lines.push('', `## ${heading}`);
    for (const item of ofKind) {
      lines.push('', ...drawEntry(item));
    }
  }

  return lines.join('\n') + '\n';
}

function drawEntry(item: KnowledgeContextEntryDto): string[] {
  const lines = [
    `### ${item.key} · ${kindName(item.kind)} · ${item.title}`,
    '',
    item.mainField,
  ];
  const facts = Object.entries(item.fields)
    .filter(([, value]) => value !== item.mainField)
    .flatMap(([name, value]) => drawField(name, value));
  if (item.rationale) {
    facts.push(`- **Rationale:** ${item.rationale}`);
  }
  if (item.links.length > 0) {
    facts.push(
      `- **Links:** ${item.links
        .map(link => `${link.type.replaceAll('-', ' ')} ${link.key}`)
        .join('; ')}`,
    );
  }
  if (facts.length > 0) {
    lines.push('', ...facts);
  }
  if (item.needsReview) {
    lines.push(
      '',
      `> Needs review: it rests on ${item.reviewCauses.join(', ')}, which has changed. Check with the person that it still holds.`,
    );
  }

  return lines;
}

function drawField(name: string, value: unknown): string[] {
  const label = `- **${fieldName(name)}:**`;
  if (value === null || value === '') return [];
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    return [label, ...value.map(entry => `  - ${drawValue(entry)}`)];
  }

  return [`${label} ${drawValue(value)}`];
}

function drawValue(value: unknown): string {
  if (value !== null && typeof value === 'object') {
    return Object.values(value)
      .filter(part => part !== null && part !== '')
      .map(String)
      .join(': ');
  }

  return String(value);
}

function drawBrief(item: KnowledgeContextItemDto): string {
  const review = item.needsReview ? ' (needs review)' : '';

  return `- \`${item.key}\` · ${kindName(item.kind)} · ${item.title}: ${item.mainField}${review}`;
}

function drawDrafts(drafts: readonly KnowledgeContextDraftDto[]): string {
  const named = drafts
    .map(draft => `${draft.key} (${kindName(draft.kind)}: ${draft.title})`)
    .join(', ');

  return `Drafts linked nearby, not approved and not part of this context: ${named}. What they say may change the picture; ask the person.`;
}

/** `business-rule` → `Business Rule`. */
function kindName(kind: KnowledgeKindDto): string {
  return kind
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** `acceptanceCriteria` → `Acceptance criteria`. */
function fieldName(name: string): string {
  const words = name.replace(/([A-Z])/g, ' $1').toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}
