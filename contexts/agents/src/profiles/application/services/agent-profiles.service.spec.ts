import { describe, expect, it } from 'vitest';

import type { WorkspaceId } from '@intentra/shared';

import type { AgentProfile } from '../../domain/agent-profile.aggregate.js';
import type { AgentProfileId } from '../../domain/value-objects/agent-profile-id.vo.js';
import type { ToolId } from '../../domain/value-objects/tool-id.vo.js';
import { UnknownToolError } from '../errors/unknown-tool.error.js';
import { AgentProfileRepository } from '../ports/agent-profile-repository.port.js';
import { ToolCatalog } from '../ports/tool-catalog.port.js';

import { AgentProfilesService } from './agent-profiles.service.js';

class InMemoryAgentProfileRepository extends AgentProfileRepository {
  readonly saved: AgentProfile[] = [];

  async save(profile: AgentProfile): Promise<void> {
    this.saved.push(profile);
  }
  async findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null> {
    return (
      this.saved.find(
        profile =>
          profile.id.equals(id) && profile.workspaceId.equals(workspaceId),
      ) ?? null
    );
  }
  async findActiveByWorkspace(): Promise<AgentProfile[]> {
    return this.saved;
  }
}

class FakeToolCatalog extends ToolCatalog {
  constructor(private readonly available: readonly string[]) {
    super();
  }
  isAvailable(tool: ToolId): boolean {
    return this.available.includes(tool.value);
  }
}

const data = {
  name: 'Reviewer',
  instructions: 'Review.',
  model: { provider: 'anthropic', name: 'claude-sonnet-5' },
};

describe('AgentProfilesService', () => {
  it('creates a profile with tools from the catalog', async () => {
    const repository = new InMemoryAgentProfileRepository();
    const service = new AgentProfilesService(
      repository,
      new FakeToolCatalog(['list_workspaces']),
    );

    const created = await service.create('ws-1', {
      ...data,
      tools: ['list_workspaces'],
    });

    expect(created.tools).toEqual(['list_workspaces']);
    expect(repository.saved).toHaveLength(1);
  });

  it('rejects a tool that is not in the catalog and saves nothing', async () => {
    const repository = new InMemoryAgentProfileRepository();
    const service = new AgentProfilesService(
      repository,
      new FakeToolCatalog(['list_workspaces']),
    );

    await expect(
      service.create('ws-1', { ...data, tools: ['get_traceability'] }),
    ).rejects.toThrow(UnknownToolError);
    expect(repository.saved).toHaveLength(0);
  });

  it('checks the catalog on update too', async () => {
    const repository = new InMemoryAgentProfileRepository();
    const service = new AgentProfilesService(
      repository,
      new FakeToolCatalog(['list_workspaces']),
    );
    const created = await service.create('ws-1', data);

    await expect(
      service.update('ws-1', created.id, { tools: ['get_traceability'] }),
    ).rejects.toThrow(UnknownToolError);
  });
});
