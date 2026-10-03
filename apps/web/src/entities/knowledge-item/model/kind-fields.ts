import {
  ConstraintFieldsDtoSchema,
  DecisionFieldsDtoSchema,
  IntegrationFieldsDtoSchema,
  PersonaFieldsDtoSchema,
  RequirementFieldsDtoSchema,
  TermFieldsDtoSchema,
  type KnowledgeFieldsDtoByKind,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

/** How a field is shown and entered. */
export const FIELD_CONTROLS = {
  /** One line of text. */
  text: 'text',
  /** A few sentences. */
  longText: 'longText',
  /** One of a few values, or none. */
  choice: 'choice',
  /** Several short texts, one per entry, in order. */
  list: 'list',
  /** A Decision's rejected alternatives, each with why. */
  alternatives: 'alternatives',
} as const;

export type FieldControl = (typeof FIELD_CONTROLS)[keyof typeof FIELD_CONTROLS];

type FieldName<K extends KnowledgeKindDto> = keyof KnowledgeFieldsDtoByKind[K] &
  string;

export type KindField<K extends KnowledgeKindDto = KnowledgeKindDto> = {
  readonly name: FieldName<K>;
  readonly control: FieldControl;
  /** The values a choice offers. */
  readonly options?: readonly string[];
  /** A list whose order matters, such as a Scenario's steps. */
  readonly ordered?: boolean;
};

export type KindFields<K extends KnowledgeKindDto = KnowledgeKindDto> = {
  /** The one required field, holding the item's statement. */
  readonly main: FieldName<K>;
  /** Every field, the main one first, in the order they are shown. */
  readonly fields: readonly KindField<K>[];
};

const text = <K extends KnowledgeKindDto>(
  name: FieldName<K>,
): KindField<K> => ({
  name,
  control: FIELD_CONTROLS.text,
});
const longText = <K extends KnowledgeKindDto>(
  name: FieldName<K>,
): KindField<K> => ({ name, control: FIELD_CONTROLS.longText });
const list = <K extends KnowledgeKindDto>(
  name: FieldName<K>,
  { ordered = false }: { readonly ordered?: boolean } = {},
): KindField<K> => ({ name, control: FIELD_CONTROLS.list, ordered });
const choice = <K extends KnowledgeKindDto>(
  name: FieldName<K>,
  options: readonly string[],
): KindField<K> => ({ name, control: FIELD_CONTROLS.choice, options });

/**
 * The fields of each Kind (docs/notes/knowledge-kinds.md), the choices read
 * from the contracts' own schemas.
 */
export const KIND_FIELDS: { readonly [K in KnowledgeKindDto]: KindFields<K> } =
  {
    'product-overview': {
      main: 'summary',
      fields: [
        longText('summary'),
        longText('problem'),
        longText('audience'),
        longText('value'),
      ],
    },
    goal: {
      main: 'outcome',
      fields: [longText('outcome'), longText('successMetric')],
    },
    persona: {
      main: 'profile',
      fields: [
        longText('profile'),
        choice(
          'type',
          PersonaFieldsDtoSchema.shape.type.unwrap().unwrap().options,
        ),
        list('needs'),
      ],
    },
    feature: {
      main: 'capability',
      fields: [longText('capability'), list('outOfScope')],
    },
    scenario: {
      main: 'expectedResult',
      fields: [longText('expectedResult'), list('steps', { ordered: true })],
    },
    requirement: {
      main: 'statement',
      fields: [
        longText('statement'),
        choice(
          'type',
          RequirementFieldsDtoSchema.shape.type.unwrap().unwrap().options,
        ),
        choice(
          'priority',
          RequirementFieldsDtoSchema.shape.priority.unwrap().unwrap().options,
        ),
        list('acceptanceCriteria'),
      ],
    },
    constraint: {
      main: 'constraint',
      fields: [
        longText('constraint'),
        choice(
          'imposedBy',
          ConstraintFieldsDtoSchema.shape.imposedBy.unwrap().unwrap().options,
        ),
      ],
    },
    term: {
      main: 'definition',
      fields: [
        longText('definition'),
        choice(
          'sort',
          TermFieldsDtoSchema.shape.sort.unwrap().unwrap().options,
        ),
        list('synonymsToAvoid'),
      ],
    },
    'business-rule': {
      main: 'rule',
      fields: [longText('rule')],
    },
    integration: {
      main: 'purpose',
      fields: [
        longText('purpose'),
        text('externalSystem'),
        choice(
          'direction',
          IntegrationFieldsDtoSchema.shape.direction.unwrap().unwrap().options,
        ),
        longText('exchanged'),
      ],
    },
    decision: {
      main: 'decision',
      fields: [
        longText('decision'),
        choice(
          'area',
          DecisionFieldsDtoSchema.shape.area.unwrap().unwrap().options,
        ),
        longText('context'),
        {
          name: 'rejectedAlternatives',
          control: FIELD_CONTROLS.alternatives,
        },
      ],
    },
    'open-question': {
      main: 'question',
      fields: [longText('question')],
    },
  };

/** The fields of a Kind, typed loosely for code that handles any Kind. */
export function kindFields(kind: KnowledgeKindDto): KindFields {
  return KIND_FIELDS[kind] as KindFields;
}
