import { describe, expect, it } from 'vitest';

import {
  InvalidKnowledgeKeyException,
  UnknownKnowledgeKindException,
} from '../exceptions/index.js';

import { KnowledgeKey } from './knowledge-key.vo.js';
import { KnowledgeKind } from './knowledge-kind.vo.js';

describe('KnowledgeKey', () => {
  it.each([
    ['TERM-1', KnowledgeKind.Term, 1],
    ['REQ-12', KnowledgeKind.Requirement, 12],
    ['DEC-305', KnowledgeKind.Decision, 305],
  ])('parses %j', (value, kind, number) => {
    // Act
    const key = KnowledgeKey.parse(value);

    // Assert
    expect(key.kind).toBe(kind);
    expect(key.number).toBe(number);
    expect(key.value).toBe(value);
  });

  it.each(['REQ', 'REQ-', 'REQ-0', 'REQ-01', 'req-1', 'REQ 1', 'REQ-1-2'])(
    'rejects %j',
    value => {
      // Act
      const parsing = () => KnowledgeKey.parse(value);

      // Assert
      expect(parsing).toThrow(InvalidKnowledgeKeyException);
    },
  );

  it('rejects a prefix no Kind has', () => {
    // Act
    const parsing = () => KnowledgeKey.parse('FOO-1');

    // Assert
    expect(parsing).toThrow(UnknownKnowledgeKindException);
  });

  it('rejects a number below one', () => {
    // Act
    const creating = () => new KnowledgeKey(KnowledgeKind.Term, 0);

    // Assert
    expect(creating).toThrow(InvalidKnowledgeKeyException);
  });
});
