import { describe, expect, it } from 'vitest';

import { InvalidProjectNameException } from '../exceptions/index.js';

import { ProjectName } from './project-name.vo.js';

describe('ProjectName', () => {
  it('trims surrounding spaces', () => {
    expect(new ProjectName('  Billing  ').value).toBe('Billing');
  });

  it.each(['', '   ', 'a'.repeat(101)])('rejects %j', value => {
    expect(() => new ProjectName(value)).toThrow(InvalidProjectNameException);
  });
});
