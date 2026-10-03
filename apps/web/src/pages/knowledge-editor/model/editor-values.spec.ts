import { describe, expect, it, vi } from 'vitest';

import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import {
  editorSchema,
  emptyValues,
  linkTypesFor,
  toFieldsDto,
  valuesFrom,
} from './editor-values';

// The Kinds' fields come through the slice's public API, which also sets up
// its endpoints; those touch the browser's window when imported.
vi.hoisted(() => {
  Object.assign(globalThis, {
    window: {
      addEventListener: () => undefined,
      matchMedia: () => ({ matches: false }),
    },
  });
});

describe('emptyValues', () => {
  it('starts every text and choice empty and every list with no entries', () => {
    // Act
    const values = emptyValues('requirement');

    // Assert
    expect(values).toEqual({
      title: '',
      rationale: '',
      fields: {
        statement: '',
        type: '',
        priority: '',
        acceptanceCriteria: [],
      },
      links: [],
    });
  });
});

describe('toFieldsDto', () => {
  it('trims texts, sends empty optional ones as null and drops blank entries', () => {
    // Arrange
    const fields = {
      statement: '  Export a report as CSV ',
      type: '',
      priority: 'must',
      acceptanceCriteria: [' Has a header row ', '  ', 'Uses commas'],
    };

    // Act
    const dto = toFieldsDto('requirement', fields);

    // Assert
    expect(dto).toEqual({
      statement: 'Export a report as CSV',
      type: null,
      priority: 'must',
      acceptanceCriteria: ['Has a header row', 'Uses commas'],
    });
  });

  it('drops alternatives with no text and sends an empty reason as null', () => {
    // Arrange
    const fields = {
      decision: 'MongoDB',
      area: 'architecture',
      context: '',
      rejectedAlternatives: [
        { alternative: 'PostgreSQL', reason: '' },
        { alternative: ' ', reason: 'Nothing' },
      ],
    };

    // Act
    const dto = toFieldsDto('decision', fields);

    // Assert
    expect(dto.rejectedAlternatives).toEqual([
      { alternative: 'PostgreSQL', reason: null },
    ]);
    expect(dto.context).toBeNull();
  });
});

describe('valuesFrom', () => {
  it('holds an item as the form does, nulls as empty texts', () => {
    // Arrange
    const item = {
      kind: 'decision',
      title: 'Database',
      rationale: null,
      fields: {
        decision: 'MongoDB',
        area: null,
        context: 'Documents',
        rejectedAlternatives: [{ alternative: 'PostgreSQL', reason: null }],
      },
      links: [{ type: 'depends-on', key: 'REQ-1' }],
    } as unknown as KnowledgeItemDto;

    // Act
    const values = valuesFrom(item);

    // Assert
    expect(values).toEqual({
      title: 'Database',
      rationale: '',
      fields: {
        decision: 'MongoDB',
        area: '',
        context: 'Documents',
        rejectedAlternatives: [{ alternative: 'PostgreSQL', reason: '' }],
      },
      links: [{ type: 'depends-on', key: 'REQ-1' }],
    });
  });
});

describe('editorSchema', () => {
  it('requires a title and the main field of the Kind', () => {
    // Arrange
    const schema = editorSchema('term');
    const values = { ...emptyValues('term'), title: ' ' };

    // Act
    const result = schema.safeParse(values);

    // Assert
    const paths = result.error?.issues.map(issue => issue.path.join('.'));
    expect(paths).toEqual(['title', 'fields.definition']);
  });

  it('requires a target on every Link', () => {
    // Arrange
    const schema = editorSchema('term');
    const values = {
      ...emptyValues('term'),
      title: 'Member',
      fields: { ...emptyValues('term').fields, definition: 'A person' },
      links: [{ type: 'uses-term' as const, key: '' }],
    };

    // Act
    const result = schema.safeParse(values);

    // Assert
    expect(result.error?.issues.map(issue => issue.path.join('.'))).toEqual([
      'links.0.key',
    ]);
  });
});

describe('linkTypesFor', () => {
  it('offers concerns only to an Open Question', () => {
    // Act
    const question = linkTypesFor('open-question');
    const requirement = linkTypesFor('requirement');

    // Assert
    expect(question).toContain('concerns');
    expect(requirement).not.toContain('concerns');
    expect(requirement).toContain('depends-on');
  });

  it('offers part-of only to a Scenario, Requirement or Business Rule', () => {
    // Act
    const rule = linkTypesFor('business-rule');
    const decision = linkTypesFor('decision');

    // Assert
    expect(rule).toContain('part-of');
    expect(decision).not.toContain('part-of');
  });
});
