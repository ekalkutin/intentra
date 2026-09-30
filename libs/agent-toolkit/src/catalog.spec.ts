import { describe, expect, it } from 'vitest';

import { MCP_TOOLS, ORCHESTRATOR_TOOLS } from './catalog.js';

describe.each([
  ['MCP_TOOLS', MCP_TOOLS],
  ['ORCHESTRATOR_TOOLS', ORCHESTRATOR_TOOLS],
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

describe('ORCHESTRATOR_TOOLS', () => {
  // Only a person approves knowledge; an Agent never does.
  it('cannot approve, reject or retire', () => {
    // Act
    const ids = Object.keys(ORCHESTRATOR_TOOLS);

    // Assert
    expect(ids).not.toContain('approve_knowledge_items');
    expect(ids).not.toContain('reject_knowledge_item');
    expect(ids).not.toContain('retire_knowledge_item');
    expect(ids).toContain('record_requirement');
    expect(ids).toContain('offer_choices');
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
