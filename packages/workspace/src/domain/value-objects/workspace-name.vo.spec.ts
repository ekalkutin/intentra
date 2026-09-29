import { describe, expect, it } from 'vitest';

import { InvalidWorkspaceNameException } from '../exceptions/index.js';

import { WorkspaceName } from './workspace-name.vo.js';

describe('WorkspaceName', () => {
  it('trims surrounding spaces', () => {
    // Act
    const name = new WorkspaceName('  Acme Corp  ');

    // Assert
    expect(name.value).toBe('Acme Corp');
  });

  it('accepts 100 characters', () => {
    // Arrange
    const value = 'a'.repeat(100);

    // Act
    const name = new WorkspaceName(value);

    // Assert
    expect(name.value).toHaveLength(100);
  });

  it.each(['', '   ', 'a'.repeat(101)])('rejects %j', value => {
    // Act
    const creating = () => new WorkspaceName(value);

    // Assert
    expect(creating).toThrow(InvalidWorkspaceNameException);
  });
});
