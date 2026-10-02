import type { KnowledgeFieldsDtoByKind } from './knowledge-fields.dto.js';
import type {
  KnowledgeKindDto,
  KnowledgeSourceDto,
  KnowledgeStatusDto,
} from './knowledge-kind.dto.js';
import type { KnowledgeLinkDto } from './knowledge-link.dto.js';

/** What the calling Member may do with this Knowledge Item right now (docs/adr/0002-client-shows-the-policy-verdict.md). */
export type KnowledgeItemAccessDto = {
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canApprove: boolean;
  readonly canReject: boolean;
  /** May record a Draft replacing this Approved item; approving it stays a Maintainer's. */
  readonly canRecordReplacement: boolean;
  readonly canRetire: boolean;
  /** May confirm, while it is marked Needs Review, that it still holds. */
  readonly canConfirm: boolean;
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
  /** The text of the Kind's main field, such as a Term's definition. */
  readonly mainField: string;
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
  /** The Knowledge Key of the Approved item this one replaces, if any. */
  readonly supersedes: string | null;
  /** Null unless replaced: who approved the replacement. */
  readonly supersededBy: string | null;
  /** ISO 8601, or null unless replaced. */
  readonly supersededAt: string | null;
  /** The Knowledge Key of the replacement, or null. */
  readonly supersededByKey: string | null;
  /** Null unless retired. */
  readonly retiredBy: string | null;
  /** ISO 8601, or null unless retired. */
  readonly retiredAt: string | null;
  /** Null unless retired with a reason. */
  readonly retirementReason: string | null;
  readonly links: KnowledgeLinkDto[];
  /** For an Open Question: the Approved items that answer it; empty while it is open. */
  readonly answeredBy: string[];
  /** Something it depends on or is justified by has changed: check that it still holds. */
  readonly needsReview: boolean;
  /** The Knowledge Keys of the targets whose change marked it. */
  readonly reviewCauses: string[];
  /**
   * Whether anything further down its `depends-on` cascade is marked Needs
   * Review. Computed when reading one item; null in lists.
   */
  readonly dependencyNeedsReview: boolean | null;
  /** Raised by every change; every write sends back the one the client saw. */
  readonly version: number;
  readonly access: KnowledgeItemAccessDto;
};

export type KnowledgeItemDto = {
  readonly [K in KnowledgeKindDto]: KnowledgeItemFrameDto & {
    readonly kind: K;
    readonly fields: KnowledgeFieldsDtoByKind[K];
  };
}[KnowledgeKindDto];

export type KnowledgeItemPageDto = {
  readonly items: KnowledgeItemDto[];
  /** How many Knowledge Items match, across every page. */
  readonly total: number;
  readonly access: KnowledgeAccessDto;
};

/** One item of a dependency cascade. */
export type KnowledgeDependencyDto = {
  readonly key: string;
  readonly kind: KnowledgeKindDto;
  readonly title: string;
  readonly mainField: string;
  readonly status: KnowledgeStatusDto;
  readonly needsReview: boolean;
  readonly version: number;
  readonly access: KnowledgeItemAccessDto;
};

/**
 * Everything a Knowledge Item reaches along `depends-on`, at any depth, the
 * item itself first, each once; and the `depends-on` Links between them.
 */
export type KnowledgeDependenciesDto = {
  readonly items: KnowledgeDependencyDto[];
  /** Whether anything below the item itself is marked Needs Review. */
  readonly dependencyNeedsReview: boolean;
  readonly links: { readonly from: string; readonly to: string }[];
};

/** How many items one Kind holds, by status. */
export type KnowledgeKindSummaryDto = {
  readonly kind: KnowledgeKindDto;
  readonly statuses: { readonly [S in KnowledgeStatusDto]: number };
  /** Drafts and Approved items marked Needs Review. */
  readonly needsReview: number;
  /** Approved items with no Link either way, outside the Project Frame: agents reach them only as an Anchor. */
  readonly unlinked: number;
};

/** How much a Project knows, counted whole: every Kind, in the model's order, empty ones included. */
export type KnowledgeSummaryDto = {
  readonly kinds: KnowledgeKindSummaryDto[];
  readonly access: KnowledgeAccessDto;
};
