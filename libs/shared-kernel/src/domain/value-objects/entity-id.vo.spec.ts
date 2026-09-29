import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { InvalidEntityIdException } from '../../exceptions/index.js';

import { EntityId } from './entity-id.vo.js';

class TestId extends EntityId {
  declare private readonly __type: 'TestId';
}

describe('EntityId', () => {
  it('generates a UUID when no value is given', () => {
    // Arrange
    const other = new TestId();

    // Act
    const id = new TestId();

    // Assert
    expect(id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(other.value).not.toBe(id.value);
  });

  it('keeps a given UUID', () => {
    // Arrange
    const value = randomUUID();

    // Act
    const id = new TestId(value);

    // Assert
    expect(id.value).toBe(value);
  });

  it.each(['', 'not-a-uuid', '12345', `${randomUUID()}x`])(
    'rejects %j',
    value => {
      // Act
      const creating = () => new TestId(value);

      // Assert
      expect(creating).toThrow(InvalidEntityIdException);
    },
  );

  it('equals another id with the same value', () => {
    // Arrange
    const value = randomUUID();
    const id = new TestId(value);
    const sameValue = new TestId(value);
    const otherValue = new TestId();

    // Act
    const equalsSameValue = id.equals(sameValue);
    const equalsOtherValue = id.equals(otherValue);

    // Assert
    expect(equalsSameValue).toBe(true);
    expect(equalsOtherValue).toBe(false);
  });

  it('serializes to its value', () => {
    // Arrange
    const id = new TestId();

    // Act
    const json = JSON.stringify({ id });
    const text = `${id}`;

    // Assert
    expect(json).toBe(`{"id":"${id.value}"}`);
    expect(text).toBe(id.value);
  });
});
