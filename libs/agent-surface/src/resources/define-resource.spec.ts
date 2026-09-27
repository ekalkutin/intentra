import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { defineResource } from './define-resource.js';

const base = {
  id: 'project_context',
  description: 'Approved knowledge of a project.',
  content: z.object({ title: z.string() }),
  exposure: { mcp: true, agents: true },
  read: async () => ({ title: 'Shop' }),
};

describe('defineResource', () => {
  it('accepts a template whose variables match the params', () => {
    const resource = defineResource({
      ...base,
      uriTemplate: 'intentra://workspaces/{workspaceId}/projects/{projectId}',
      params: z.object({ workspaceId: z.string(), projectId: z.string() }),
    });

    expect(resource.id).toBe('project_context');
  });

  it('rejects a template outside the intentra scheme', () => {
    expect(() =>
      defineResource({
        ...base,
        uriTemplate: 'https://example.com/{projectId}',
        params: z.object({ projectId: z.string() }),
      }),
    ).toThrow('must start with intentra://');
  });

  it('rejects a variable that is not in the params', () => {
    expect(() =>
      defineResource({
        ...base,
        uriTemplate: 'intentra://projects/{projectId}',
        params: z.object({}),
      }),
    ).toThrow('not in params: projectId');
  });

  it('rejects a param that is not in the template', () => {
    expect(() =>
      defineResource({
        ...base,
        uriTemplate: 'intentra://projects',
        params: z.object({ projectId: z.string() }),
      }),
    ).toThrow('not in URI: projectId');
  });

  it('rejects URI template operators beyond simple variables', () => {
    expect(() =>
      defineResource({
        ...base,
        uriTemplate: 'intentra://projects{?projectId}',
        params: z.object({ projectId: z.string() }),
      }),
    ).toThrow('is not a simple URI template variable');
  });
});
