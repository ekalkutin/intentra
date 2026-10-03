import {
  BusinessRuleContent,
  type BusinessRuleFields,
} from './business-rule-content.vo.js';
import {
  ConstraintContent,
  type ConstraintFields,
} from './constraint-content.vo.js';
import { DecisionContent, type DecisionFields } from './decision-content.vo.js';
import { FeatureContent, type FeatureFields } from './feature-content.vo.js';
import { GoalContent, type GoalFields } from './goal-content.vo.js';
import {
  IntegrationContent,
  type IntegrationFields,
} from './integration-content.vo.js';
import { KnowledgeKind } from './knowledge-kind.vo.js';
import {
  OpenQuestionContent,
  type OpenQuestionFields,
} from './open-question-content.vo.js';
import { PersonaContent, type PersonaFields } from './persona-content.vo.js';
import {
  ProductOverviewContent,
  type ProductOverviewFields,
} from './product-overview-content.vo.js';
import {
  RequirementContent,
  type RequirementFields,
} from './requirement-content.vo.js';
import { ScenarioContent, type ScenarioFields } from './scenario-content.vo.js';
import { TermContent, type TermFields } from './term-content.vo.js';

/** The fields of a Knowledge Item's Kind. */
export type KnowledgeContent =
  | ProductOverviewContent
  | GoalContent
  | PersonaContent
  | FeatureContent
  | ScenarioContent
  | RequirementContent
  | ConstraintContent
  | TermContent
  | BusinessRuleContent
  | IntegrationContent
  | DecisionContent
  | OpenQuestionContent;

/** The plain fields of some Kind, as its content takes and gives them. */
export type KnowledgeFields =
  | ProductOverviewFields
  | GoalFields
  | PersonaFields
  | FeatureFields
  | ScenarioFields
  | RequirementFields
  | ConstraintFields
  | TermFields
  | BusinessRuleFields
  | IntegrationFields
  | DecisionFields
  | OpenQuestionFields;

/**
 * Builds each Kind's content from its plain fields. The fields must be that
 * Kind's shape (the published schemas and the stored documents guarantee it);
 * the content then checks their values.
 */
const CONTENT_OF_KIND: ReadonlyMap<
  KnowledgeKind,
  (fields: never) => KnowledgeContent
> = new Map<KnowledgeKind, (fields: never) => KnowledgeContent>([
  [
    KnowledgeKind.ProductOverview,
    (fields: ProductOverviewFields) => new ProductOverviewContent(fields),
  ],
  [KnowledgeKind.Goal, (fields: GoalFields) => new GoalContent(fields)],
  [
    KnowledgeKind.Persona,
    (fields: PersonaFields) => new PersonaContent(fields),
  ],
  [
    KnowledgeKind.Feature,
    (fields: FeatureFields) => new FeatureContent(fields),
  ],
  [
    KnowledgeKind.Scenario,
    (fields: ScenarioFields) => new ScenarioContent(fields),
  ],
  [
    KnowledgeKind.Requirement,
    (fields: RequirementFields) => new RequirementContent(fields),
  ],
  [
    KnowledgeKind.Constraint,
    (fields: ConstraintFields) => new ConstraintContent(fields),
  ],
  [KnowledgeKind.Term, (fields: TermFields) => new TermContent(fields)],
  [
    KnowledgeKind.BusinessRule,
    (fields: BusinessRuleFields) => new BusinessRuleContent(fields),
  ],
  [
    KnowledgeKind.Integration,
    (fields: IntegrationFields) => new IntegrationContent(fields),
  ],
  [
    KnowledgeKind.Decision,
    (fields: DecisionFields) => new DecisionContent(fields),
  ],
  [
    KnowledgeKind.OpenQuestion,
    (fields: OpenQuestionFields) => new OpenQuestionContent(fields),
  ],
]);

export function createKnowledgeContent(
  kind: KnowledgeKind,
  fields: KnowledgeFields,
): KnowledgeContent {
  const create = CONTENT_OF_KIND.get(kind);
  if (!create) {
    throw new Error(`No content is defined for the Kind ${kind.value}`);
  }

  return create(fields as never);
}

/** Whether two contents say the same: the same fields with the same values. */
export function sameKnowledgeContent(
  a: KnowledgeContent,
  b: KnowledgeContent,
): boolean {
  return JSON.stringify(a.toFields()) === JSON.stringify(b.toFields());
}
