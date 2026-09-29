import type {
  DecisionFieldsDto,
  RequirementFieldsDto,
  TermFieldsDto,
} from './knowledge-fields.dto.js';
import type {
  KnowledgeKindDto,
  KnowledgeSourceDto,
  KnowledgeStatusDto,
} from './knowledge-kind.dto.js';

/** What the calling Member may do with this Knowledge Item right now (docs/adr/0002-client-shows-the-policy-verdict.md). */
export type KnowledgeItemAccessDto = {
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canApprove: boolean;
  readonly canReject: boolean;
};

/** What the calling Member may do with a Project's knowledge as a whole. */
export type KnowledgeAccessDto = {
  /** The Kinds they may record Drafts of. */
  readonly canRecord: KnowledgeKindDto[];
};

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
  /** Null unless Approved. */
  readonly approvedBy: string | null;
  /** ISO 8601, or null unless Approved. */
  readonly approvedAt: string | null;
  /** Null unless Rejected. */
  readonly rejectedBy: string | null;
  /** ISO 8601, or null unless Rejected. */
  readonly rejectedAt: string | null;
  /** Null unless Rejected with a reason. */
  readonly rejectionReason: string | null;
  /** Raised by every change; every write sends back the one the client saw. */
  readonly version: number;
  readonly access: KnowledgeItemAccessDto;
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
  readonly access: KnowledgeAccessDto;
};
