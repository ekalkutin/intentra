import { describe, expect, it } from 'vitest';

import { OrganizationId } from './organization-id.vo.js';
import { ProjectId } from './project-id.vo.js';

describe('EntityId', () => {
  it('генерирует значение, когда его не передали', () => {
    expect(new OrganizationId().value).toHaveLength(36);
  });

  it('сохраняет переданное значение', () => {
    const id = new OrganizationId('11111111-1111-1111-1111-111111111111');

    expect(id.value).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('отвергает пустое значение', () => {
    expect(() => new ProjectId('')).toThrow('EntityId cannot be empty');
  });

  it('сравнивает по значению, а не по ссылке', () => {
    const value = '22222222-2222-2222-2222-222222222222';

    expect(new ProjectId(value).equals(new ProjectId(value))).toBe(true);
  });

  it('сериализуется в строку', () => {
    const id = new ProjectId('33333333-3333-3333-3333-333333333333');

    expect(JSON.stringify({ id })).toBe(
      '{"id":"33333333-3333-3333-3333-333333333333"}',
    );
  });
});
