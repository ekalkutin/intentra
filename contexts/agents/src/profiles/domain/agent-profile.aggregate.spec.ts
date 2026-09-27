import { describe, expect, it } from 'vitest';

import { WorkspaceId } from '@intentra/shared';

import { AgentProfileArchivedError } from './agent-profile-archived.error.js';
import { AgentProfile } from './agent-profile.aggregate.js';
import { AgentName } from './value-objects/agent-name.vo.js';
import { Instructions } from './value-objects/instructions.vo.js';
import { ModelRef } from './value-objects/model-ref.vo.js';
import { ToolId } from './value-objects/tool-id.vo.js';

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

    profile.allowTool(ToolId.GetTraceability);
    profile.allowTool(ToolId.GetTraceability);

    expect(profile.tools).toEqual([ToolId.GetTraceability]);
  });

  it('revokes an allowed tool', () => {
    const profile = createProfile();
    profile.allowTool(ToolId.GetTraceability);
    profile.allowTool(ToolId.SearchProjectKnowledge);

    profile.revokeTool(ToolId.GetTraceability);

    expect(profile.tools).toEqual([ToolId.SearchProjectKnowledge]);
  });

  it('does not expose its tools for outside changes', () => {
    const profile = createProfile();

    (profile.tools as ToolId[]).push(ToolId.GetTraceability);

    expect(profile.tools).toEqual([]);
  });

  it('rejects any change once archived', () => {
    const profile = createProfile();
    profile.archive();

    expect(profile.isArchived).toBe(true);
    expect(() => profile.rename(new AgentName('Other'))).toThrow(
      AgentProfileArchivedError,
    );
    expect(() => profile.allowTool(ToolId.GetTraceability)).toThrow(
      AgentProfileArchivedError,
    );
    expect(() => profile.archive()).toThrow(AgentProfileArchivedError);
  });
});
