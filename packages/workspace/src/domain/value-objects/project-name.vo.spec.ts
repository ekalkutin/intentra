import { describe, expect, it } from 'vitest';

import { InvalidProjectNameException } from '../exceptions/index.js';

import { ProjectName } from './project-name.vo.js';

describe('ProjectName', () => {
  it('trims surrounding spaces', () => {
    // Act
    const name = new ProjectName('  Billing  ');

    // Assert
    expect(name.value).toBe('Billing');
  });

  it.each(['', '   ', 'a'.repeat(101)])('rejects %j', value => {
    // Act
    const creating = () => new ProjectName(value);

    // Assert
    expect(creating).toThrow(InvalidProjectNameException);
  });
});
