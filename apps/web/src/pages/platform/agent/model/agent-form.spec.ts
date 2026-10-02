import { describe, expect, it } from 'vitest';

import { emptyAgent, toSaveAgentDto, type AgentFormValues } from './agent-form';

const VALUES: AgentFormValues = {
  name: '  Researcher ',
  description: 'Digs into requirements\n',
  instructions: '\nFind the gaps.',
  modelProfileId: 'm1',
  tools: ['list_knowledge'],
  skillIds: ['s1'],
  specialistIds: ['a2'],
};

describe('emptyAgent', () => {
  it('starts on the only Model Profile', () => {
    // Act
    const values = emptyAgent(['m1']);

    // Assert
    expect(values.modelProfileId).toBe('m1');
  });

  it('leaves the choice open among several', () => {
    // Act
    const values = emptyAgent(['m1', 'm2']);

    // Assert
    expect(values.modelProfileId).toBe('');
  });
});

describe('toSaveAgentDto', () => {
  it('trims the texts and keeps Intentra’s Specialists', () => {
    // Act
    const dto = toSaveAgentDto(VALUES, true);

    // Assert
    expect(dto).toEqual({
      name: 'Researcher',
      description: 'Digs into requirements',
      instructions: 'Find the gaps.',
      modelProfileId: 'm1',
      tools: ['list_knowledge'],
      skillIds: ['s1'],
      specialistIds: ['a2'],
    });
  });

  it('gives a Specialist no one to call', () => {
    // Act
    const dto = toSaveAgentDto(VALUES, false);

    // Assert
    expect(dto.specialistIds).toEqual([]);
  });
});
