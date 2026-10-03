import { z } from 'zod';

import type { KnowledgeKindDto } from './knowledge-kind.dto.js';

/** An optional text: a gap to ask about when null. */
const optionalText = (description: string) =>
  z.string().nullable().default(null).describe(description);

/**
 * The fields of each Kind. Only the main field is required
 * (docs/notes/knowledge-kinds.md); an empty optional field is a gap to ask
 * about, not something to invent. The descriptions reach agents as tool docs.
 */
export const TermFieldsDtoSchema = z.object({
  definition: z
    .string()
    .describe('The main field: what the word means in this Project.'),
  sort: z
    .enum(['entity', 'value', 'role', 'action-event', 'other'])
    .nullable()
    .default(null)
    .describe(
      'What sort of concept it names: something with its own identity, a value, a role, an action or event, or other.',
    ),
  synonymsToAvoid: z
    .array(z.string())
    .default([])
    .describe('Other words people use for it that the Project avoids.'),
});

export type TermFieldsDto = z.infer<typeof TermFieldsDtoSchema>;

/** How much a Requirement matters, MoSCoW without "won't". */
export const RequirementPriorityDtoSchema = z.enum(['must', 'should', 'could']);

export type RequirementPriorityDto = z.infer<
  typeof RequirementPriorityDtoSchema
>;

export const RequirementFieldsDtoSchema = z.object({
  statement: z
    .string()
    .describe('The main field: what the system does, or what quality it has.'),
  type: z
    .enum(['functional', 'non-functional'])
    .nullable()
    .default(null)
    .describe('A function the system performs, or a quality it has.'),
  priority: RequirementPriorityDtoSchema.nullable()
    .default(null)
    .describe('How much it matters.'),
  acceptanceCriteria: z
    .array(z.string())
    .default([])
    .describe('How to tell that it is met, one check per entry.'),
});

export type RequirementFieldsDto = z.infer<typeof RequirementFieldsDtoSchema>;

export const DecisionFieldsDtoSchema = z.object({
  decision: z.string().describe('The main field: what the Project has chosen.'),
  area: z
    .enum(['architecture', 'product', 'business'])
    .nullable()
    .default(null)
    .describe('What the choice is about.'),
  context: z
    .string()
    .nullable()
    .default(null)
    .describe('The situation that called for the choice.'),
  rejectedAlternatives: z
    .array(
      z.object({
        alternative: z.string().describe('An option that was turned down.'),
        reason: z
          .string()
          .nullable()
          .default(null)
          .describe('Why it was turned down.'),
      }),
    )
    .default([])
    .describe('The options turned down, each with why.'),
});

export type DecisionFieldsDto = z.infer<typeof DecisionFieldsDtoSchema>;

export const ProductOverviewFieldsDtoSchema = z.object({
  summary: z
    .string()
    .describe(
      'The main field: what the product is and for whom, in a few sentences.',
    ),
  problem: optionalText('The problem it solves.'),
  audience: optionalText('Who it is for.'),
  value: optionalText('What its users gain.'),
});

export type ProductOverviewFieldsDto = z.infer<
  typeof ProductOverviewFieldsDtoSchema
>;

export const GoalFieldsDtoSchema = z.object({
  outcome: z
    .string()
    .describe('The main field: what the Project wants to achieve.'),
  successMetric: optionalText('How to tell that it is achieved.'),
});

export type GoalFieldsDto = z.infer<typeof GoalFieldsDtoSchema>;

export const PersonaFieldsDtoSchema = z.object({
  profile: z.string().describe('The main field: who they are.'),
  type: z
    .enum(['person', 'system'])
    .nullable()
    .default(null)
    .describe('A person or a system.'),
  needs: z
    .array(z.string())
    .default([])
    .describe('What they need from the product, one need per entry.'),
});

export type PersonaFieldsDto = z.infer<typeof PersonaFieldsDtoSchema>;

export const FeatureFieldsDtoSchema = z.object({
  capability: z
    .string()
    .describe(
      'The main field: what users can do with this capability of the product and what they get.',
    ),
  outOfScope: z
    .array(z.string())
    .default([])
    .describe('What the Feature deliberately does not do, one per entry.'),
});

export type FeatureFieldsDto = z.infer<typeof FeatureFieldsDtoSchema>;

export const ScenarioFieldsDtoSchema = z.object({
  expectedResult: z
    .string()
    .describe('The main field: what the performer gets in the end.'),
  steps: z
    .array(z.string())
    .default([])
    .describe('What the performer does, one step per entry, in order.'),
});

export type ScenarioFieldsDto = z.infer<typeof ScenarioFieldsDtoSchema>;

export const ConstraintFieldsDtoSchema = z.object({
  constraint: z
    .string()
    .describe(
      'The main field: what is imposed on the Project from outside and not up for discussion.',
    ),
  imposedBy: z
    .enum([
      'law',
      'budget',
      'deadline',
      'customer',
      'company',
      'infrastructure',
    ])
    .nullable()
    .default(null)
    .describe('Where it comes from.'),
});

export type ConstraintFieldsDto = z.infer<typeof ConstraintFieldsDtoSchema>;

export const BusinessRuleFieldsDtoSchema = z.object({
  rule: z.string().describe('The main field: the rule, in one sentence.'),
});

export type BusinessRuleFieldsDto = z.infer<typeof BusinessRuleFieldsDtoSchema>;

export const IntegrationFieldsDtoSchema = z.object({
  purpose: z.string().describe('The main field: what the integration is for.'),
  externalSystem: optionalText('The system on the other side.'),
  direction: z
    .enum(['outbound', 'inbound', 'both'])
    .nullable()
    .default(null)
    .describe('Outbound: we send to them; inbound: they send to us; or both.'),
  exchanged: optionalText('What is exchanged.'),
});

export type IntegrationFieldsDto = z.infer<typeof IntegrationFieldsDtoSchema>;

export const OpenQuestionFieldsDtoSchema = z.object({
  question: z
    .string()
    .describe('The main field: what about the Project is not settled yet.'),
});

export type OpenQuestionFieldsDto = z.infer<typeof OpenQuestionFieldsDtoSchema>;

/** Each Kind's fields schema, by the Kind. */
export const KNOWLEDGE_FIELDS_DTO_SCHEMAS = {
  'product-overview': ProductOverviewFieldsDtoSchema,
  goal: GoalFieldsDtoSchema,
  persona: PersonaFieldsDtoSchema,
  feature: FeatureFieldsDtoSchema,
  scenario: ScenarioFieldsDtoSchema,
  requirement: RequirementFieldsDtoSchema,
  constraint: ConstraintFieldsDtoSchema,
  term: TermFieldsDtoSchema,
  'business-rule': BusinessRuleFieldsDtoSchema,
  integration: IntegrationFieldsDtoSchema,
  decision: DecisionFieldsDtoSchema,
  'open-question': OpenQuestionFieldsDtoSchema,
} as const satisfies Record<KnowledgeKindDto, z.ZodObject>;

/** Each Kind's fields, by the Kind. */
export type KnowledgeFieldsDtoByKind = {
  readonly [K in KnowledgeKindDto]: z.infer<
    (typeof KNOWLEDGE_FIELDS_DTO_SCHEMAS)[K]
  >;
};
