import { describe, expect, it } from 'vitest';

import type { WorkspaceId } from '@intentra/shared';

import type { AgentsModuleOptions } from '../../../agents.module-definition.js';
import type { AgentProfile } from '../../../domain/entities/index.js';
import { OrchestratorCannotBeArchivedException } from '../../../domain/exceptions/index.js';
import type { AgentProfileId } from '../../../domain/value-objects/index.js';
import {
  AgentProfileNotFoundException,
  UnknownToolException,
} from '../../exceptions/index.js';
import {
  AgentProfileRepository,
  ToolCatalog,
  type CatalogTool,
} from '../../ports/index.js';

import {
  CreateAgentProfileCommand,
  CreateAgentProfileCommandHandler,
} from './create-agent-profile/create-agent-profile.command.js';
import {
  DeleteAgentProfileCommand,
  DeleteAgentProfileCommandHandler,
} from './delete-agent-profile/delete-agent-profile.command.js';
import {
  EnsureOrchestratorCommand,
  EnsureOrchestratorCommandHandler,
} from './ensure-orchestrator/ensure-orchestrator.command.js';
import {
  FindManyAgentProfilesQuery,
  FindManyAgentProfilesQueryHandler,
} from './find-many-agent-profiles/find-many-agent-profiles.query.js';
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
  async addOrchestratorIfAbsent(orchestrator: AgentProfile): Promise<void> {
    if (!(await this.findOrchestrator(orchestrator.workspaceId))) {
      await this.save(orchestrator);
    }
  }
  async findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null> {
    const profile = this.saved.get(id.value);
    return profile?.workspaceId.equals(workspaceId) ? profile : null;
  }
  async findOrchestrator(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile | null> {
    return (
      [...this.saved.values()].find(
        profile =>
          profile.role.isOrchestrator &&
          profile.workspaceId.equals(workspaceId),
      ) ?? null
    );
  }
  async findActiveByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile[]> {
    return [...this.saved.values()].filter(
      profile => !profile.isArchived && profile.workspaceId.equals(workspaceId),
    );
  }
}

class FakeToolCatalog extends ToolCatalog {
  find(): readonly CatalogTool[] {
    return [{ id: 'list_workspaces', description: 'List workspaces.' }];
  }
}

const data = {
  name: 'Reviewer',
  description: 'Reviews changes.',
  instructions: 'Review.',
  model: 'anthropic/claude-sonnet-5',
};

const options = {
  defaultModel: 'openai/gpt-5-mini',
} as AgentsModuleOptions;

function setup() {
  const repository = new InMemoryAgentProfileRepository();
  const catalog = new FakeToolCatalog();
  return {
    repository,
    create: new CreateAgentProfileCommandHandler(repository, catalog),
    update: new UpdateAgentProfileCommandHandler(repository, catalog),
    remove: new DeleteAgentProfileCommandHandler(repository),
    ensure: new EnsureOrchestratorCommandHandler(repository, options),
    get: new GetOneAgentProfileQueryHandler(repository),
    findMany: new FindManyAgentProfilesQueryHandler(repository),
  };
}

describe('agent profiles', () => {
  it('creates a specialist with tools from the catalog', async () => {
    const { create, get } = setup();

    const id = await create.execute(
      new CreateAgentProfileCommand('ws-1', {
        ...data,
        tools: ['list_workspaces'],
      }),
    );

    const profile = await get.execute(new GetOneAgentProfileQuery('ws-1', id));
    expect(profile).toMatchObject({
      role: 'specialist',
      description: 'Reviews changes.',
      model: 'anthropic/claude-sonnet-5',
      tools: ['list_workspaces'],
    });
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

describe('orchestrator', () => {
  it('is made once per workspace, on the default model', async () => {
    const { ensure, get } = setup();

    const first = await ensure.execute(new EnsureOrchestratorCommand('ws-1'));
    const second = await ensure.execute(new EnsureOrchestratorCommand('ws-1'));

    expect(second).toBe(first);
    const orchestrator = await get.execute(
      new GetOneAgentProfileQuery('ws-1', first),
    );
    expect(orchestrator).toMatchObject({
      role: 'orchestrator',
      model: 'openai/gpt-5-mini',
    });
  });

  it('comes first in the list', async () => {
    const { create, ensure, findMany } = setup();
    await create.execute(new CreateAgentProfileCommand('ws-1', data));
    await ensure.execute(new EnsureOrchestratorCommand('ws-1'));

    const profiles = await findMany.execute(
      new FindManyAgentProfilesQuery('ws-1'),
    );

    expect(profiles.map(profile => profile.role)).toEqual([
      'orchestrator',
      'specialist',
    ]);
  });

  it('cannot be deleted but can be changed', async () => {
    const { ensure, remove, update, get } = setup();
    const id = await ensure.execute(new EnsureOrchestratorCommand('ws-1'));

    await expect(
      remove.execute(new DeleteAgentProfileCommand('ws-1', id)),
    ).rejects.toThrow(OrchestratorCannotBeArchivedException);

    await update.execute(
      new UpdateAgentProfileCommand('ws-1', id, { name: 'Lead' }),
    );
    const orchestrator = await get.execute(
      new GetOneAgentProfileQuery('ws-1', id),
    );
    expect(orchestrator.name).toBe('Lead');
  });
});
