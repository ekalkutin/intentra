import { z } from 'zod';

import type {
  KnowledgeKindDto,
  KnowledgeStatusDto,
} from './knowledge-kind.dto.js';

/**
 * What a Gap misses, in the order Gaps are listed. Of the Project, with no
 * item: `no-product-overview`, `no-persona`, `no-goal`. Of an item's fields,
 * Drafts and Approved alike: `requirement-without-acceptance-criteria` (a
 * Must), `goal-without-success-metric`, `decision-without-rejected-alternatives`,
 * `scenario-without-persona` (no `depends-on` to one). Of coverage:
 * `persona-without-scenario` (a person, not a system, no Scenario depends on),
 * `scenario-without-requirement`, `feature-without-goal` (no `depends-on` to
 * one), `feature-without-parts`, `scenario-without-feature` (only once the
 * Project has a Feature), `integration-without-use` (no Requirement or
 * Business Rule depends on it). `unlinked`: an Approved item outside the
 * Project Frame, and not a Feature, with no Link either way with another
 * Approved item. A Draft
 * closes a Gap as an Approved item does.
 */
export const KnowledgeGapRuleDtoSchema = z.enum([
  'no-product-overview',
  'no-persona',
  'no-goal',
  'requirement-without-acceptance-criteria',
  'goal-without-success-metric',
  'decision-without-rejected-alternatives',
  'scenario-without-persona',
  'persona-without-scenario',
  'scenario-without-requirement',
  'feature-without-goal',
  'feature-without-parts',
  'scenario-without-feature',
  'integration-without-use',
  'unlinked',
]);

export type KnowledgeGapRuleDto = z.infer<typeof KnowledgeGapRuleDtoSchema>;

/** The item a Gap is about. */
export type KnowledgeGapItemDto = {
  readonly key: string;
  readonly kind: KnowledgeKindDto;
  readonly title: string;
  readonly status: KnowledgeStatusDto;
};

export type KnowledgeGapDto = {
  readonly rule: KnowledgeGapRuleDto;
  /** `null` for a Gap of the Project as a whole. */
  readonly item: KnowledgeGapItemDto | null;
};

/** Every Gap of a Project, by rule, then by Kind and Knowledge Key. */
export type KnowledgeGapsDto = {
  readonly gaps: KnowledgeGapDto[];
};
