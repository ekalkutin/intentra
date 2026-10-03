import { z } from 'zod';

/** One Knowledge Item as the Auditor reads it: every field, every Link. */
export type AuditedItem = {
  readonly key: string;
  readonly kind: string;
  readonly status: string;
  readonly title: string;
  readonly fields: object;
  readonly links: readonly { readonly type: string; readonly key: string }[];
};

/**
 * What one model call of an Analysis Run judges: one item, the knowledge
 * around it, and what was already asked about them.
 */
export type AuditGroup = {
  /** The item under check. */
  readonly item: AuditedItem;
  /** Its Similar Items and the items it is linked to, either way. */
  readonly around: readonly AuditedItem[];
  /** The Open Questions about any of them, Rejected ones included. */
  readonly questions: readonly AuditedItem[];
};

export const auditFindingSchema = z.object({
  title: z.string().describe('A short title for the Open Question.'),
  question: z
    .string()
    .describe('The question in one sentence a person can answer.'),
  rationale: z
    .string()
    .describe(
      'Quotes the items by Knowledge Key and says exactly where they disagree or what is unclear.',
    ),
  concerns: z
    .array(z.string())
    .min(1)
    .describe(
      'The Knowledge Keys the finding is about, the item under check among them.',
    ),
});

export type AuditFinding = z.infer<typeof auditFindingSchema>;

export const auditFindingsSchema = z.object({
  findings: z.array(auditFindingSchema),
});

/** The task of one call: the group laid out for the model, the item under check first. */
export function auditTask(group: AuditGroup): string {
  return [
    'Judge the item under check against the knowledge around it.',
    '## The item under check',
    renderItem(group.item),
    '## Around it: its Similar Items and the items it is linked to',
    group.around.length > 0
      ? group.around.map(renderItem).join('\n\n')
      : 'Nothing.',
    '## Open Questions already recorded about these items',
    'A Rejected one was judged not to be a problem: never raise it again.',
    group.questions.length > 0
      ? group.questions.map(renderItem).join('\n\n')
      : 'None.',
    '## Your answer',
    'Every finding about the item under check, alone or against the items around it: a contradiction, an ambiguity or a doubtful rule. Leave out what an Open Question above already asks, and what concerns only the items around it. Nothing found: an empty list.',
  ].join('\n\n');
}

function renderItem(item: AuditedItem): string {
  const lines = [
    `### ${item.key} (${item.kind}, ${item.status})`,
    `title: ${item.title}`,
  ];
  collectFieldLines(item.fields, '', lines);
  if (item.links.length > 0) {
    lines.push(
      `links: ${item.links.map(link => `${link.type} ${link.key}`).join(', ')}`,
    );
  }

  return lines.join('\n');
}

function collectFieldLines(value: unknown, path: string, lines: string[]) {
  if (value === null || value === undefined || value === '') {
    return;
  }
  if (Array.isArray(value)) {
    for (const element of value) {
      collectFieldLines(element, path, lines);
    }

    return;
  }
  if (typeof value === 'object') {
    for (const [name, field] of Object.entries(value)) {
      collectFieldLines(field, path ? `${path}.${name}` : name, lines);
    }

    return;
  }
  lines.push(`${path}: ${String(value)}`);
}
