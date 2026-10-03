import { describe, expect, it, vi } from 'vitest';

import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import { layOutPassport } from './chapters';

// The Feature helpers come through the slice's public API, which also sets up
// its endpoints; those touch the browser's window when imported.
vi.hoisted(() => {
  Object.assign(globalThis, {
    window: {
      addEventListener: () => undefined,
      matchMedia: () => ({ matches: false }),
    },
  });
});

function item(
  key: string,
  kind: KnowledgeKindDto,
  fields: Record<string, unknown> = {},
  feature: string | null = null,
): KnowledgeItemDto {
  return {
    key,
    kind,
    fields,
    status: 'approved',
    links: feature ? [{ type: 'part-of', key: feature }] : [],
  } as KnowledgeItemDto;
}

describe('layOutPassport', () => {
  it('lists every chapter in reading order, empty ones included', () => {
    // Act
    const chapters = layOutPassport([]);

    // Assert
    expect(chapters.map(chapter => [chapter.id, chapter.count])).toEqual([
      ['overview', 0],
      ['goals', 0],
      ['users', 0],
      ['capabilities', 0],
      ['rules', 0],
      ['integrations', 0],
      ['qualities', 0],
      ['decisions', 0],
    ]);
  });

  it('puts functions and untyped Requirements with the scenarios, qualities with the constraints', () => {
    // Arrange
    const items = [
      item('REQ-1', 'requirement', { type: 'functional' }),
      item('REQ-2', 'requirement', { type: 'non-functional' }),
      item('REQ-3', 'requirement', { type: null }),
      item('SCN-1', 'scenario'),
      item('CON-1', 'constraint'),
    ];

    // Act
    const chapters = layOutPassport(items);

    // Assert
    const keysOf = (id: string) =>
      chapters
        .find(chapter => chapter.id === id)
        ?.groups.map(group => group.items.map(each => each.key));
    expect(keysOf('capabilities')).toEqual([['SCN-1'], ['REQ-1', 'REQ-3']]);
    expect(keysOf('qualities')).toEqual([['CON-1'], ['REQ-2']]);
  });

  it('leaves empty groups out of a chapter and counts what it holds', () => {
    // Arrange
    const items = [item('TERM-1', 'term'), item('TERM-2', 'term')];

    // Act
    const chapters = layOutPassport(items);

    // Assert
    const rules = chapters.find(chapter => chapter.id === 'rules');
    expect(rules?.groups.map(group => group.kind)).toEqual(['term']);
    expect(rules?.count).toBe(2);
  });

  it('counts a Kind from the summary when only part of it was loaded', () => {
    // Arrange
    const items = [item('TERM-1', 'term'), item('REQ-1', 'requirement')];

    // Act
    const chapters = layOutPassport(items, { term: 240, requirement: 300 });

    // Assert
    const rules = chapters.find(chapter => chapter.id === 'rules');
    const capabilities = chapters.find(
      chapter => chapter.id === 'capabilities',
    );
    expect(rules?.groups[0]?.total).toBe(240);
    expect(capabilities?.groups[0]?.total).toBe(1);
  });

  it('leads the capabilities with each Feature and all its parts, leaving the rest without a Feature', () => {
    // Arrange
    const items = [
      item('FEAT-1', 'feature'),
      item('REQ-1', 'requirement', { type: 'functional' }, 'FEAT-1'),
      item('REQ-2', 'requirement', { type: 'non-functional' }, 'FEAT-1'),
      item('BR-1', 'business-rule', {}, 'FEAT-1'),
      item('SC-1', 'scenario', {}, 'FEAT-1'),
      item('SC-2', 'scenario'),
      item('BR-2', 'business-rule'),
    ];

    // Act
    const chapters = layOutPassport(items, { 'business-rule': 2 });

    // Assert
    const chapter = (id: string) => chapters.find(each => each.id === id);
    const capabilities = chapter('capabilities');
    expect(
      capabilities?.groups.map(group => [
        group.feature?.key ?? null,
        group.withoutFeature ?? false,
        group.items.map(each => each.key),
      ]),
    ).toEqual([
      ['FEAT-1', false, ['SC-1', 'REQ-1', 'REQ-2', 'BR-1']],
      [null, true, ['SC-2']],
    ]);
    expect(capabilities?.count).toBe(6);
    expect(
      chapter('rules')?.groups.map(group => [
        group.items.map(each => each.key),
        group.total,
      ]),
    ).toEqual([[['BR-2'], 1]]);
    expect(chapter('qualities')?.count).toBe(0);
  });
});
