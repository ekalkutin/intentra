import type {
  DecisionFieldsDto,
  RequirementFieldsDto,
  TermFieldsDto,
} from './knowledge-fields.dto.js';
import type {
  KnowledgeSourceDto,
  KnowledgeStatusDto,
} from './knowledge-kind.dto.js';

type KnowledgeItemFrameDto = {
  readonly id: string;
  /** Such as `REQ-12`; addresses the Knowledge Item within its Project. */
  readonly key: string;
  readonly title: string;
  readonly status: KnowledgeStatusDto;
  readonly source: KnowledgeSourceDto;
  readonly rationale: string | null;
  /** The Member who recorded it. */
  readonly authorId: string;
  /** ISO 8601 */
  readonly recordedAt: string;
  /** Null until someone edits it. */
  readonly lastEditedBy: string | null;
  /** ISO 8601, or null until someone edits it. */
  readonly lastEditedAt: string | null;
};

export type KnowledgeItemDto = KnowledgeItemFrameDto &
  (
    | { readonly kind: 'term'; readonly fields: TermFieldsDto }
    | { readonly kind: 'requirement'; readonly fields: RequirementFieldsDto }
    | { readonly kind: 'decision'; readonly fields: DecisionFieldsDto }
  );

export type KnowledgeItemPageDto = {
  readonly items: KnowledgeItemDto[];
  /** How many Knowledge Items match, across every page. */
  readonly total: number;
};
