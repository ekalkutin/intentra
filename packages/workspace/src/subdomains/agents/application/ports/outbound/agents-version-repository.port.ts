import { AgentsVersion } from '../../../domain/entities/index.js';
import { AgentsVersionNotFoundException } from '../../../domain/exceptions/index.js';
import type { AgentsVersionNumber } from '../../../domain/value-objects/index.js';

/** One Agents Version by its number, or the latest one: the Published Agents. */
export type AgentsVersionQueryProps =
  { readonly number: AgentsVersionNumber } | { readonly latest: true };

export abstract class AgentsVersionRepository {
  /** Adds a new Agents Version; one never changes once saved. */
  abstract save(version: AgentsVersion): Promise<void>;
  abstract findOne(
    props: AgentsVersionQueryProps,
  ): Promise<AgentsVersion | null>;
  /** Newest first. */
  abstract findMany(): Promise<AgentsVersion[]>;

  public async getOne(props: AgentsVersionQueryProps): Promise<AgentsVersion> {
    const version = await this.findOne(props);
    if (!version) {
      throw new AgentsVersionNotFoundException();
    }

    return version;
  }
}
