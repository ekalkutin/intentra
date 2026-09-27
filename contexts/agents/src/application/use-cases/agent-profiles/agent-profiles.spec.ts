import { describe, expect, it } from 'vitest';

import type { WorkspaceId } from '@intentra/shared';

import type { AgentProfile } from '../../../domain/entities/index.js';
import type {
  AgentProfileId,
  ToolId,
} from '../../../domain/value-objects/index.js';
import {
  AgentProfileNotFoundException,
  UnknownToolException,
} from '../../exceptions/index.js';
import { AgentProfileRepository, ToolCatalog } from '../../ports/index.js';

import {
  CreateAgentProfileCommand,
  CreateAgentProfileCommandHandler,
} from './create-agent-profile/create-agent-profile.command.js';
import {
  DeleteAgentProfileCommand,
  DeleteAgentProfileCommandHandler,
} from './delete-agent-profile/delete-agent-profile.command.js';
import {
  GetOneAgentProfileQuery,
  GetOneAgentProfileQueryHandler,
} from './get-one-agent-profile/get-one-agent-profile.query.js';
import {
  UpdateAgentProfileCommand,
  UpdateAgentProfileCommandHandler,
} from './update-agent-profile/update-agent-profile.command.js';

class InMemoryAgentProfileRepository extends AgentProfileRepository {
  readonly saved = new Map<string, AgentProfile>();

  async save(profile: AgentProfile): Promise<void> {
    this.saved.set(profile.id.value, profile);
  }
  async findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null> {
    const profile = this.saved.get(id.value);
    return profile?.workspaceId.equals(workspaceId) ? profile : null;
  }
  async findActiveByWorkspace(): Promise<AgentProfile[]> {
    return [...this.saved.values()].filter(profile => !profile.isArchived);
  }
}

class FakeToolCatalog extends ToolCatalog {
  isAvailable(tool: ToolId): boolean {
    return tool.value === 'list_workspaces';
  }
}

const data = {
  name: 'Reviewer',
  instructions: 'Review.',
  model: { provider: 'anthropic', name: 'claude-sonnet-5' },
};

function setup() {
  const repository = new InMemoryAgentProfileRepository();
  const catalog = new FakeToolCatalog();
  return {
    repository,
    create: new CreateAgentProfileCommandHandler(repository, catalog),
    update: new UpdateAgentProfileCommandHandler(repository, catalog),
    remove: new DeleteAgentProfileCommandHandler(repository),
    get: new GetOneAgentProfileQueryHandler(repository),
  };
}

describe('agent profiles', () => {
  it('creates a profile with tools from the catalog', async () => {
    const { create, get } = setup();

    const id = await create.execute(
      new CreateAgentProfileCommand('ws-1', {
        ...data,
        tools: ['list_workspaces'],
      }),
    );

    const profile = await get.execute(new GetOneAgentProfileQuery('ws-1', id));
    expect(profile.tools).toEqual(['list_workspaces']);
  });

  it('rejects a tool that is not in the catalog and saves nothing', async () => {
    const { create, repository } = setup();

    await expect(
      create.execute(
        new CreateAgentProfileCommand('ws-1', {
          ...data,
          tools: ['get_traceability'],
        }),
      ),
    ).rejects.toThrow(UnknownToolException);
    expect(repository.saved.size).toBe(0);
  });

  it('checks the catalog on update too', async () => {
    const { create, update } = setup();
    const id = await create.execute(
      new CreateAgentProfileCommand('ws-1', data),
    );

    await expect(
      update.execute(
        new UpdateAgentProfileCommand('ws-1', id, {
          tools: ['get_traceability'],
        }),
      ),
    ).rejects.toThrow(UnknownToolException);
  });

  it('does not find an archived profile', async () => {
    const { create, remove, get } = setup();
    const id = await create.execute(
      new CreateAgentProfileCommand('ws-1', data),
    );

    await remove.execute(new DeleteAgentProfileCommand('ws-1', id));

    await expect(
      get.execute(new GetOneAgentProfileQuery('ws-1', id)),
    ).rejects.toThrow(AgentProfileNotFoundException);
    await expect(
      remove.execute(new DeleteAgentProfileCommand('ws-1', id)),
    ).rejects.toThrow(AgentProfileNotFoundException);
  });
});
