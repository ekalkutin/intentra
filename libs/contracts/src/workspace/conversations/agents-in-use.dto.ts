/** The type of the first chunk of every answer, telling which Agents make it. */
export const AGENTS_IN_USE_CHUNK_TYPE = 'data-agents-in-use';

export type AgentsInUseDto = {
  /** The Published Agents' number; null for the Unpublished Agents, in a Platform Admin's own Conversation. */
  readonly versionNumber: number | null;
};
