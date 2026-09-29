import { describe, expect, it } from 'vitest';

import { InvalidProjectSlugException } from '../exceptions/index.js';

import { ProjectSlug } from './project-slug.vo.js';

describe('ProjectSlug', () => {
  it.each(['api', 'billing-service', 'web-2', 'a'.repeat(15)])(
    'accepts %j',
    value => {
      // Act
      const slug = new ProjectSlug(value);

      // Assert
      expect(slug.value).toBe(value);
    },
  );

  it.each(['ab', 'a'.repeat(16), 'Billing', 'web app', '-api', 'api-', 'a--b'])(
    'rejects %j',
    value => {
      // Act
      const creating = () => new ProjectSlug(value);

      // Assert
      expect(creating).toThrow(InvalidProjectSlugException);
    },
  );
});
