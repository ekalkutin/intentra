import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { InvalidEntityIdException } from '../../exceptions/index.js';

import { EntityId } from './entity-id.vo.js';

class TestId extends EntityId {
  declare private readonly __type: 'TestId';
}

describe('EntityId', () => {
  it('generates a UUID when no value is given', () => {
    const id = new TestId();

    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(new TestId().value).not.toBe(id.value);
  });

  it('keeps a given UUID', () => {
    const value = randomUUID();

    expect(new TestId(value).value).toBe(value);
  });

  it.each(['', 'not-a-uuid', '12345', `${randomUUID()}x`])(
    'rejects %j',
    value => {
      expect(() => new TestId(value)).toThrow(InvalidEntityIdException);
    },
  );

  it('equals another id with the same value', () => {
    const value = randomUUID();

    expect(new TestId(value).equals(new TestId(value))).toBe(true);
    expect(new TestId(value).equals(new TestId())).toBe(false);
  });

  it('serializes to its value', () => {
    const id = new TestId();

    expect(JSON.stringify({ id })).toBe(`{"id":"${id.value}"}`);
    expect(`${id}`).toBe(id.value);
  });
});
