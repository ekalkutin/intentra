import { describe, expect, it } from 'vitest';

import { WorkspaceId } from '@intentra/shared';

import { AgentName } from '../value-objects/agent-name.vo.js';
import { Instructions } from '../value-objects/instructions.vo.js';
import { ModelRef } from '../value-objects/model-ref.vo.js';
import { ToolId } from '../value-objects/tool-id.vo.js';

import { AgentProfileArchivedError } from './agent-profile-archived.error.js';
import { AgentProfile } from './agent-profile.aggregate.js';

const listWorkspaces = new ToolId('list_workspaces');
const searchKnowledge = new ToolId('search_project_knowledge');

const createProfile = (): AgentProfile =>
  AgentProfile.create({
    workspaceId: new WorkspaceId(),
    name: new AgentName('Security Reviewer'),
    instructions: new Instructions('Review changes for security risks.'),
    model: new ModelRef('anthropic', 'claude-sonnet-5'),
  });

describe('AgentProfile', () => {
  it('starts active and without tools', () => {
    const profile = createProfile();

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
      AgentProfileArchivedError,
    );
    expect(() => profile.allowTool(listWorkspaces)).toThrow(
      AgentProfileArchivedError,
    );
    expect(() => profile.archive()).toThrow(AgentProfileArchivedError);
  });
});
