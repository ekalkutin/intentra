import { describe, expect, it } from 'vitest';

import { EMPTY_SKILL, skillFormSchema } from './skill-form';

describe('skillFormSchema', () => {
  it('takes a name after the intentra- prefix', () => {
    // Act
    const result = skillFormSchema.safeParse({
      name: 'intentra-interviewing',
      description: 'When interviewing a person',
      instructions: 'Ask one question at a time.',
    });

    // Assert
    expect(result.success).toBe(true);
  });

  it('refuses the bare prefix a new Skill starts with', () => {
    // Act
    const result = skillFormSchema.safeParse({
      ...EMPTY_SKILL,
      description: 'When interviewing a person',
      instructions: 'Ask one question at a time.',
    });

    // Assert
    expect(result.success).toBe(false);
  });

  it('refuses capitals and spaces', () => {
    // Act
    const result = skillFormSchema.safeParse({
      name: 'intentra-Big Name',
      description: 'When interviewing a person',
      instructions: 'Ask one question at a time.',
    });

    // Assert
    expect(result.success).toBe(false);
  });
});
