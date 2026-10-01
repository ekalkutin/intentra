import { UnpublishedAgents } from '../../../domain/entities/index.js';

/** Holds the one Unpublished Agents. */
export abstract class UnpublishedAgentsRepository {
  abstract save(unpublished: UnpublishedAgents): Promise<void>;
  /** Null until Agents Version 1 is made. */
  abstract findOne(): Promise<UnpublishedAgents | null>;
}
