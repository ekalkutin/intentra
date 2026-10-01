import type { AgentsContentDto } from './agents-content.dto.js';

/** An Agents Version as the history lists it. */
export type AgentsVersionSummaryDto = {
  readonly number: number;
  readonly note: string | null;
  readonly publishedByEmail: string;
  /** ISO 8601 */
  readonly publishedAt: string;
};

export type AgentsVersionDto = AgentsVersionSummaryDto & {
  readonly content: AgentsContentDto;
};

/** What a Platform Admin is editing. */
export type UnpublishedAgentsDto = {
  /** The Published Agents' number; null until the first publishing. */
  readonly publishedNumber: number | null;
  readonly content: AgentsContentDto;
};
