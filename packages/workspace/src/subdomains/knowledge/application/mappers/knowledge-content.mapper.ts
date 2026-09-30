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

/** The new content of an edited Draft, or undefined when its fields stay. */
export function toChangedKnowledgeContent(
  data: EditKnowledgeItemDto,
): KnowledgeContent | undefined {
  return (
    data.fields &&
    createKnowledgeContent(KnowledgeKind.from(data.kind), data.fields)
  );
}
