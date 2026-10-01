import { describe, expect, it } from 'vitest';

import type { AgentsChangesDto } from '@intentra/contracts/workspace';

import { changeKinds, countChanges } from './changes';

const CHANGES: AgentsChangesDto = {
  agents: [
    { id: 'a1', name: 'Orchestrator', kind: 'changed', fields: ['tools'] },
    { id: 'a2', name: 'Analyst', kind: 'added', fields: [] },
  ],
  skills: [],
  modelProfiles: [{ id: 'm1', name: 'Fast', kind: 'removed', fields: [] }],
  problems: [],
};

describe('changeKinds', () => {
  it('maps each changed object to how it differs', () => {
    // Act
    const kinds = changeKinds(CHANGES.agents);

    // Assert
    expect(kinds.get('a1')).toBe('changed');
    expect(kinds.get('a2')).toBe('added');
    expect(kinds.get('unchanged')).toBeUndefined();
  });

  it('knows nothing while the changes load', () => {
    // Act
    const kinds = changeKinds(undefined);

    // Assert
    expect(kinds.size).toBe(0);
  });
});

describe('countChanges', () => {
  it('counts the changed objects of every sort', () => {
    // Act
    const count = countChanges(CHANGES);

    // Assert
    expect(count).toBe(3);
  });
});
