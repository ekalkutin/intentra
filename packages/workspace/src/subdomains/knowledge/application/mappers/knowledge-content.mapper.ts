import type {
  EditKnowledgeItemDto,
  RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';

import {
  createKnowledgeContent,
  KnowledgeKind,
  type KnowledgeContent,
} from '../../domain/value-objects/index.js';

export function toKnowledgeContent(
  data: RecordKnowledgeItemDto,
): KnowledgeContent {
  return createKnowledgeContent(KnowledgeKind.from(data.kind), data.fields);
}

/**
 * The new content of an edited Draft: its `current` content with the fields
 * given changed, or undefined when none are given.
 */
export function toChangedKnowledgeContent(
  data: EditKnowledgeItemDto,
  current: KnowledgeContent,
): KnowledgeContent | undefined {
  return (
    data.fields &&
    createKnowledgeContent(KnowledgeKind.from(data.kind), {
      ...current.toFields(),
      ...data.fields,
    })
  );
}
