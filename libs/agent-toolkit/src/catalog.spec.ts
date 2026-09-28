import { describe, expect, it } from 'vitest';

import { AGENT_TOOLS, MCP_TOOLS } from './catalog.js';

describe.each([
  ['MCP_TOOLS', MCP_TOOLS],
  ['AGENT_TOOLS', AGENT_TOOLS],
])('%s', (_name, tools) => {
  it('keys every tool by its snake_case id', () => {
    for (const [key, tool] of Object.entries(tools)) {
      expect(key).toBe(tool.id);
      expect(tool.id).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });
});

describe.each(Object.values(MCP_TOOLS))('MCP tool $id', tool => {
  it('has input and output schemas', () => {
    expect(tool.inputSchema).toBeDefined();
    expect(tool.outputSchema).toBeDefined();
  });

  // MCP carries a structured result only as an object: wrap lists.
  it('returns an object', () => {
    const output = tool.outputSchema?.['~standard'].jsonSchema.output({
      target: 'draft-2020-12',
    });

    expect(output?.type).toBe('object');
  });

  // Clients rely on the hints to ask the person before a write.
  it('states whether it changes data', () => {
    const annotations = tool.mcp?.annotations;

    expect(typeof annotations?.readOnlyHint).toBe('boolean');
    expect(annotations?.readOnlyHint && annotations.destructiveHint).not.toBe(
      true,
    );
  });
});
