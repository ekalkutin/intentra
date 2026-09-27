import { describe, expect, it } from 'vitest';

import { RESOURCE_CATALOG, TOOL_CATALOG } from './catalog.js';

describe('TOOL_CATALOG', () => {
  it('has unique tool ids', () => {
    const ids = TOOL_CATALOG.map(tool => tool.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names every tool in snake_case', () => {
    for (const tool of TOOL_CATALOG) {
      expect(tool.id).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });

  it('never offers a tool that changes data through MCP', () => {
    const writableOverMcp = TOOL_CATALOG.filter(
      tool => tool.exposure.mcp && !tool.readOnly,
    );

    expect(writableOverMcp).toEqual([]);
  });
});

describe('RESOURCE_CATALOG', () => {
  it('has unique resource ids', () => {
    const ids = RESOURCE_CATALOG.map(resource => resource.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names every resource in snake_case', () => {
    for (const resource of RESOURCE_CATALOG) {
      expect(resource.id).toMatch(/^[a-z]+(_[a-z]+)*$/);
    }
  });
});
