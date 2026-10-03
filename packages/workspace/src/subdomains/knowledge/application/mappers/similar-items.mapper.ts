import { createHash } from 'node:crypto';

import type { SimilarKnowledgeItemDto } from '@intentra/contracts/workspace';

import type { ProjectRole } from '../../../tenancy/index.js';
import type { KnowledgeItem } from '../../domain/entities/index.js';

import { toKnowledgeDependencyDto } from './knowledge-item.mapper.js';

/**
 * The text a Knowledge Item's meaning is read from: its Kind, its title and
 * every field of its Kind, one per line. The Rationale stays out: it tells
 * where the item came from, not what it says.
 */
export function toSimilarityText(item: KnowledgeItem): string {
  const lines = [`${item.kind.value}: ${item.title.value}`];
  collectFieldLines(item.content.toFields(), '', lines);

  return lines.join('\n');
}

/** A digest of a similarity text: the same text, the same vector. */
export function toSimilarityFingerprint(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export function toSimilarKnowledgeItemDto(
  item: KnowledgeItem,
  projectRole: ProjectRole,
  similarity: number,
): SimilarKnowledgeItemDto {
  return {
    ...toKnowledgeDependencyDto(item, projectRole),
    similarity: Math.round(Math.max(0, similarity) * 1000) / 1000,
  };
}

function collectFieldLines(value: unknown, path: string, lines: string[]) {
  if (value === null || value === undefined || value === '') {
    return;
  }
  if (Array.isArray(value)) {
    for (const element of value) {
      collectFieldLines(element, path, lines);
    }

    return;
  }
  if (typeof value === 'object') {
    for (const [name, field] of Object.entries(value)) {
      collectFieldLines(field, path ? `${path}.${name}` : name, lines);
    }

    return;
  }
  lines.push(`${path}: ${String(value)}`);
}
