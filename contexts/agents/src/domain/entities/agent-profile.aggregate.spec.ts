import { describe, expect, it } from 'vitest';

import { WorkspaceId } from '@intentra/shared';

import {
  AgentProfileArchivedException,
  OrchestratorCannotBeArchivedException,
} from '../exceptions/index.js';
import {
  AgentDescription,
  AgentName,
  AgentRole,
  Instructions,
  ModelId,
  ToolId,
} from '../value-objects/index.js';

import { AgentProfile } from './agent-profile.aggregate.js';

const listWorkspaces = new ToolId('list_workspaces');
const searchKnowledge = new ToolId('search_project_knowledge');

const createProfile = (): AgentProfile =>
  AgentProfile.createSpecialist({
    workspaceId: new WorkspaceId(),
    name: new AgentName('Security Reviewer'),
    description: new AgentDescription('Finds security risks in changes.'),
    instructions: new Instructions('Review changes for security risks.'),
    model: new ModelId('anthropic/claude-sonnet-5'),
  });

describe('AgentProfile', () => {
  it('starts as an active specialist without tools', () => {
    const profile = createProfile();

    expect(profile.role).toBe(AgentRole.SPECIALIST);
    expect(profile.isArchived).toBe(false);
    expect(profile.tools).toEqual([]);
  });

  it('allows a tool only once', () => {
    const profile = createProfile();

    profile.allowTool(listWorkspaces);
    profile.allowTool(listWorkspaces);

    expect(profile.tools).toEqual([listWorkspaces]);
  });

  it('revokes an allowed tool', () => {
    const profile = createProfile();
    profile.allowTool(listWorkspaces);
    profile.allowTool(searchKnowledge);

    profile.revokeTool(listWorkspaces);

    expect(profile.tools).toEqual([searchKnowledge]);
  });

  it('replaces the whole tool list, dropping duplicates', () => {
    const profile = createProfile();
    profile.allowTool(listWorkspaces);

    profile.replaceTools([searchKnowledge, searchKnowledge]);

    expect(profile.tools).toEqual([searchKnowledge]);
  });

  it('does not expose its tools for outside changes', () => {
    const profile = createProfile();

    (profile.tools as ToolId[]).push(listWorkspaces);

    expect(profile.tools).toEqual([]);
  });

  it('rejects any change once archived', () => {
    const profile = createProfile();
    profile.archive();

    expect(profile.isArchived).toBe(true);
    expect(() => profile.rename(new AgentName('Other'))).toThrow(
      AgentProfileArchivedException,
    );
    expect(() => profile.allowTool(listWorkspaces)).toThrow(
      AgentProfileArchivedException,
    );
    expect(() => profile.archive()).toThrow(AgentProfileArchivedException);
  });

  it('makes an orchestrator with default wording', () => {
    const orchestrator = AgentProfile.createOrchestrator({
      workspaceId: new WorkspaceId(),
      model: new ModelId('anthropic/claude-sonnet-5'),
    });

    expect(orchestrator.role.isOrchestrator).toBe(true);
    expect(orchestrator.name.value).toBe('Orchestrator');
    expect(orchestrator.description.value).not.toBe('');
  });

  it('never archives the orchestrator', () => {
    const orchestrator = AgentProfile.createOrchestrator({
      workspaceId: new WorkspaceId(),
      model: new ModelId('anthropic/claude-sonnet-5'),
    });

    expect(() => orchestrator.archive()).toThrow(
      OrchestratorCannotBeArchivedException,
    );
    expect(orchestrator.isArchived).toBe(false);
  });
});
