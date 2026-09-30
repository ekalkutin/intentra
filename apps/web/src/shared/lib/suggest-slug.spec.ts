import { describe, expect, it } from 'vitest';

import { suggestSlug } from './suggest-slug';

const MAX_LENGTH = 15;

describe('suggestSlug', () => {
  it.each([
    ['Acme Corp', 'acme-corp'],
    ['Биллинг', 'billing'],
    ['Щука и ёж', 'schuka-i-ezh'],
    ['  CRM -- 2.0!  ', 'crm-2-0'],
    ['Café', 'cafe'],
  ])('turns %s into %s', (name, expected) => {
    // Act
    const slug = suggestSlug(name, MAX_LENGTH);

    // Assert
    expect(slug).toBe(expected);
  });

  it('cuts a long name without leaving a hyphen at the end', () => {
    // Arrange
    const name = 'Платформа знаний проекта';

    // Act
    const slug = suggestSlug(name, MAX_LENGTH);

    // Assert
    expect(slug).toBe('platforma-znani');
    expect(slug.length).toBeLessThanOrEqual(MAX_LENGTH);
  });

  it('cuts right before a hyphen without keeping it', () => {
    // Act
    const slug = suggestSlug('abcdefghijklmn opq', MAX_LENGTH);

    // Assert
    expect(slug).toBe('abcdefghijklmn');
  });

  it('gives nothing for a name with no letters or digits', () => {
    // Act
    const slug = suggestSlug('— ! —', MAX_LENGTH);

    // Assert
    expect(slug).toBe('');
  });
});
