import type { DecisionContent } from './decision-content.vo.js';
import type { RequirementContent } from './requirement-content.vo.js';
import type { TermContent } from './term-content.vo.js';

/** The fields of a Knowledge Item's Kind. */
export type KnowledgeContent =
  TermContent | RequirementContent | DecisionContent;
