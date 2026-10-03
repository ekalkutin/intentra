import { z } from 'zod';

import type { KnowledgeFieldsDtoByKind } from './knowledge-fields.dto.js';
import type { KnowledgeKindDto } from './knowledge-kind.dto.js';
import type {
  KnowledgeLinkDto,
  KnowledgeLinkTypeDto,
} from './knowledge-link.dto.js';

/** At most this many Anchors in one Context Pack. */
export const KNOWLEDGE_CONTEXT_MAX_ANCHORS = 20;

export const GetKnowledgeContextDtoSchema = z.object({
  /**
   * The Knowledge Keys of the Anchors, each Approved. In a query string:
   * `anchors=REQ-12,SC-4`.
   */
  anchors: z.preprocess(
    value => (typeof value === 'string' ? value.split(',') : value),
    z.array(z.string().trim().min(1)).min(1).max(KNOWLEDGE_CONTEXT_MAX_ANCHORS),
  ),
});

export type GetKnowledgeContextDto = z.infer<
  typeof GetKnowledgeContextDtoSchema
>;

/**
 * Why an item is in a Context Pack: `anchor`, the subject of the task;
 * `part`, part of a Feature that is an Anchor, gathered from as if it were an
 * Anchor itself; `foundation`, what the Anchors rest on (`depends-on`,
 * `justified-by`, `part-of`, at any depth); `rule`, a Business Rule that depends on an Anchor or on the
 * foundation, which the code must keep; `may-be-affected`, what links to an
 * Anchor; `term`, a Term used;
 * `conflict`, what contradicts an item of the pack; `unsettled`, an Open
 * Question about one, not answered yet.
 */
export const KnowledgeContextRoleDtoSchema = z.enum([
  'anchor',
  'part',
  'foundation',
  'rule',
  'may-be-affected',
  'term',
  'conflict',
  'unsettled',
]);

export type KnowledgeContextRoleDto = z.infer<
  typeof KnowledgeContextRoleDtoSchema
>;

/** `full`: every field; `brief`: key, Kind, title and main field only, past the pack's budget. */
export const KnowledgeContextDetailDtoSchema = z.enum(['full', 'brief']);

export type KnowledgeContextDetailDto = z.infer<
  typeof KnowledgeContextDetailDtoSchema
>;

type KnowledgeContextEntryFrameDto = {
  readonly key: string;
  readonly title: string;
  /** The text of the Kind's main field. */
  readonly mainField: string;
  readonly rationale: string | null;
  readonly links: KnowledgeLinkDto[];
  /** It may no longer hold: something it rests on has changed. */
  readonly needsReview: boolean;
  /** The Knowledge Keys of the changed targets that marked it. */
  readonly reviewCauses: string[];
};

/** An Approved Knowledge Item as an agent reads it. */
export type KnowledgeContextEntryDto = {
  readonly [K in KnowledgeKindDto]: KnowledgeContextEntryFrameDto & {
    readonly kind: K;
    readonly fields: KnowledgeFieldsDtoByKind[K];
  };
}[KnowledgeKindDto];

/** An item of a Context Pack; a `brief` one carries no fields, rationale or links. */
export type KnowledgeContextItemDto =
  | (KnowledgeContextEntryDto & {
      readonly role: KnowledgeContextRoleDto;
      /** Steps from the nearest Anchor along the Links, 0 for an Anchor. */
      readonly distance: number;
      readonly detail: 'full';
    })
  | {
      readonly key: string;
      readonly kind: KnowledgeKindDto;
      readonly title: string;
      readonly mainField: string;
      readonly needsReview: boolean;
      readonly role: KnowledgeContextRoleDto;
      readonly distance: number;
      readonly detail: 'brief';
    };

/** A Draft linked to or from an item of the pack; named, never part of it. */
export type KnowledgeContextDraftDto = {
  readonly key: string;
  readonly kind: KnowledgeKindDto;
  readonly title: string;
};

/**
 * The Approved knowledge an agent needs for one task, gathered from its
 * Anchors along the Links; each item once, under its role.
 */
export type KnowledgeContextDto = {
  readonly anchors: string[];
  /** Anchors first, then by role, distance and Knowledge Key. */
  readonly items: KnowledgeContextItemDto[];
  /** The Links between items of the pack. */
  readonly links: {
    readonly from: string;
    readonly to: string;
    readonly type: KnowledgeLinkTypeDto;
  }[];
  readonly draftsNearby: KnowledgeContextDraftDto[];
  /** How many items the Project Frame holds, read apart with `frame`. */
  readonly frameSize: number;
  /** The pack drawn for an agent to read. */
  readonly markdown: string;
};

/**
 * What holds for every task in the Project: the Product Overview, every
 * Approved Constraint and every Approved non-functional Requirement.
 */
export type KnowledgeFrameDto = {
  readonly items: KnowledgeContextEntryDto[];
  /** The frame drawn for an agent to read. */
  readonly markdown: string;
};
