import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { KnowledgeItemId } from '../../../domain/value-objects/index.js';

import { InMemorySimilarItemsIndexAdapter } from './in-memory-similar-items-index.adapter.js';

const workspaceId = new WorkspaceId();
const projectId = new ProjectId();

function point(vector: number[]) {
  return { itemId: new KnowledgeItemId(), fingerprint: 'f', vector };
}

describe('InMemorySimilarItemsIndexAdapter', () => {
  it('finds the nearest items of the Project, the closest first, the queried item left out', async () => {
    // Arrange
    const index = new InMemorySimilarItemsIndexAdapter();
    const queried = point([1, 0]);
    const close = point([1, 0.1]);
    const far = point([0, 1]);
    const elsewhere = point([1, 0]);
    await index.upsert(workspaceId, projectId, [queried, close, far]);
    await index.upsert(workspaceId, new ProjectId(), [elsewhere]);

    // Act
    const matches = await index.nearest(
      projectId,
      { itemId: queried.itemId },
      10,
    );

    // Assert
    expect(matches.map(match => match.itemId.value)).toEqual([
      close.itemId.value,
      far.itemId.value,
    ]);
    expect(matches[0]!.similarity).toBeCloseTo(0.995, 3);
    expect(matches[1]!.similarity).toBe(0);
  });

  it('empties one Project and leaves the others', async () => {
    // Arrange
    const index = new InMemorySimilarItemsIndexAdapter();
    const otherProjectId = new ProjectId();
    await index.upsert(workspaceId, projectId, [point([1, 0])]);
    await index.upsert(workspaceId, otherProjectId, [point([0, 1])]);

    // Act
    await index.deleteMany({ projectId });

    // Assert
    expect(await index.entries(projectId)).toEqual([]);
    expect(await index.entries(otherProjectId)).toHaveLength(1);
  });
});
