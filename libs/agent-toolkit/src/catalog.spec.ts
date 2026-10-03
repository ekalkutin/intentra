import { describe, expect, it } from 'vitest';

import { AGENT_TOOLS, MCP_TOOLS } from './catalog.js';

describe.each([
  ['MCP_TOOLS', MCP_TOOLS],
  ['AGENT_TOOLS', AGENT_TOOLS],
])('%s', (_name, tools) => {
  it('keys every tool by its snake_case id', () => {
    // Act
    const entries = Object.entries(tools);

    // Assert
    for (const [key, tool] of entries) {
      expect(key).toBe(tool.id);
      expect(tool.id).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });
});

describe.each(Object.values(MCP_TOOLS))('MCP tool $id', tool => {
  it('has input and output schemas', () => {
    // Act
    const { inputSchema, outputSchema } = tool;

    // Assert
    expect(inputSchema).toBeDefined();
    expect(outputSchema).toBeDefined();
  });

  // MCP carries a structured result only as an object: wrap lists.
  it('returns an object', () => {
    // Act
    const output = tool.outputSchema?.['~standard'].jsonSchema.output({
      target: 'draft-2020-12',
    });

    // Assert
    expect(output?.type).toBe('object');
  });

  // Clients rely on the hints to ask the person before a write.
  it('states whether it changes data', () => {
    // Act
    const annotations = tool.mcp?.annotations;

    // Assert
    expect(typeof annotations?.readOnlyHint).toBe('boolean');
    expect(annotations?.readOnlyHint && annotations.destructiveHint).not.toBe(
      true,
    );
  });
});

describe.each(
  Object.values(MCP_TOOLS).filter(tool => tool.id.startsWith('edit_')),
)('MCP tool $id', tool => {
  // The rationale is what the person said the item rests on, set when recorded.
  it('leaves the rationale as recorded', () => {
    // Act
    const input = tool.inputSchema?.['~standard'].jsonSchema.input({
      target: 'draft-2020-12',
    });

    // Assert
    expect(input?.properties).not.toHaveProperty('rationale');
  });
});
