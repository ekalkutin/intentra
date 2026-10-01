import type { AgentsContentDto } from './agents-content.dto.js';

/** An Agents Version as the history lists it. */
export type AgentsVersionSummaryDto = {
  readonly number: number;
  readonly note: string | null;
  /** Null for Agents Version 1, made from what the code held before. */
  readonly publishedByEmail: string | null;
  /** ISO 8601 */
  readonly publishedAt: string;
};

export type AgentsVersionDto = AgentsVersionSummaryDto & {
  readonly content: AgentsContentDto;
};

/** What a Platform Admin is editing, and which Agents Version it started from. */
export type UnpublishedAgentsDto = {
  /** The Published Agents' number. */
  readonly publishedNumber: number;
  readonly content: AgentsContentDto;
};
