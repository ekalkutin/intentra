import { MockEmbeddingModelV4 } from 'ai/test';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CallerDto,
  RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';
import { TestingApp } from '@intentra/platform-testing';

import { givenAccount } from '../../../../testing/account.fixtures.js';
import { givenOpenWorkspaceCreation } from '../../../../testing/workspace-creation.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import { ProviderKeyService } from '../../../agents/index.js';
import { ProjectsService, WorkspacesService } from '../../../tenancy/index.js';

import { KnowledgeService } from './knowledge.service.js';

/** How many dimensions the scripted model's vectors have. */
const DIMENSIONS = 256;

/** Every text the scripted model was asked to read, in order. */
const embedded: string[] = [];

/** Reads a text as the words it holds: texts sharing words are close in meaning. */
const scriptedModel = new MockEmbeddingModelV4({
  maxEmbeddingsPerCall: null,
  doEmbed: async ({ values }) => {
    embedded.push(...values);

    return {
      embeddings: values.map(value => {
        const vector = Array.from({ length: DIMENSIONS }, () => 0);
        for (const word of value.toLowerCase().match(/[a-z]+/g) ?? []) {
          let hash = 0;
          for (const char of word) {
            hash = (hash * 31 + char.charCodeAt(0)) % DIMENSIONS;
          }
          vector[hash]! += 1;
        }

        return vector;
      }),
      warnings: [],
    };
  },
});

function person(actor: Actor): CallerDto {
  return { actor, agent: null };
}

function term(title: string, definition: string): RecordKnowledgeItemDto {
  return {
    kind: 'term',
    title,
    rationale: null,
    supersedes: null,
    links: [],
    fields: { definition, sort: null, synonymsToAvoid: [] },
  };
}

const requirement: RecordKnowledgeItemDto = {
  kind: 'requirement',
  title: 'PDF export',
  rationale: null,
  supersedes: null,
  links: [],
  fields: {
    statement: 'Export a monthly report to PDF',
    type: 'functional',
    priority: 'must',
    acceptanceCriteria: ['The report opens in a PDF viewer'],
  },
};

describe('Similar Items integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        WorkspaceModule.register({
          agents: {
            providerKeyEncryptionKey: Buffer.alloc(32, 7).toString('base64'),
          },
          knowledge: { embeddingModel: () => scriptedModel },
        }),
      ],
    });
  });

  beforeEach(() => givenOpenWorkspaceCreation(app));

  afterEach(async () => {
    embedded.length = 0;
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  type Setup = { ada: CallerDto; workspaceId: string; projectId: string };

  /** Ada owns the Workspace, maintains its Project and, unless told, has added a Provider Key. */
  async function setUp({ withKey = true } = {}): Promise<Setup> {
    const actor = await givenAccount(app, 'ada@example.com');
    const workspace = await app
      .get(WorkspacesService)
      .create(actor, { name: 'Acme', slug: 'acme' });
    const project = await app
      .get(ProjectsService)
      .create(actor, workspace.id, { name: 'Billing', slug: 'billing' });
    if (withKey) {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('{}', { status: 200 }),
      );
      await app
        .get(ProviderKeyService)
        .set(actor, workspace.id, { key: 'sk-or-v1-0123456789abcdef' });
    }

    return {
      ada: person(actor),
      workspaceId: workspace.id,
      projectId: project.id,
    };
  }

  async function record(
    { ada, workspaceId, projectId }: Setup,
    data: RecordKnowledgeItemDto,
  ): Promise<string> {
    const item = await app
      .get(KnowledgeService)
      .record(ada, workspaceId, projectId, data);

    return item.key;
  }

  function similar({ ada, workspaceId, projectId }: Setup, key: string) {
    return app
      .get(KnowledgeService)
      .similar(ada, workspaceId, projectId, key, { take: 10 });
  }

  it('finds the items closest in meaning, linked or not, the closest first and the item itself left out', async () => {
    // Arrange
    const setup = await setUp();
    const req = await record(setup, requirement);
    const report = await record(
      setup,
      term('Report', 'A monthly report printed as PDF'),
    );
    const invoice = await record(
      setup,
      term('Invoice', 'A bill sent to a customer'),
    );

    // Act
    const found = await similar(setup, req);

    // Assert
    expect(found.available).toBe(true);
    expect(found.items.map(item => item.key)).toEqual([report, invoice]);
    expect(found.items[0]!.similarity).toBeGreaterThan(
      found.items[1]!.similarity,
    );
  });

  it('reads anew only what changed since the last search', async () => {
    // Arrange
    const setup = await setUp();
    const req = await record(setup, requirement);
    const report = await record(
      setup,
      term('Report', 'A monthly report printed as PDF'),
    );
    await similar(setup, req);
    embedded.length = 0;
    await app
      .get(KnowledgeService)
      .edit(setup.ada, setup.workspaceId, setup.projectId, report, {
        kind: 'term',
        version: 1,
        fields: { definition: 'A yearly summary printed as PDF' },
      });

    // Act
    await similar(setup, req);

    // Assert
    expect(embedded).toEqual([
      'term: Report\ndefinition: A yearly summary printed as PDF',
    ]);
  });

  it('leaves out a Draft once it is deleted', async () => {
    // Arrange
    const setup = await setUp();
    const req = await record(setup, requirement);
    const report = await record(
      setup,
      term('Report', 'A monthly report printed as PDF'),
    );
    await similar(setup, req);
    await app
      .get(KnowledgeService)
      .delete(setup.ada, setup.workspaceId, setup.projectId, report, {
        version: 1,
      });

    // Act
    const found = await similar(setup, req);

    // Assert
    expect(found.items).toEqual([]);
  });

  it('finds the Similar Items of a Rejected item, which is not one itself', async () => {
    // Arrange
    const setup = await setUp();
    const req = await record(setup, requirement);
    const report = await record(
      setup,
      term('Report', 'A monthly report printed as PDF'),
    );
    await app
      .get(KnowledgeService)
      .reject(setup.ada, setup.workspaceId, setup.projectId, report, {
        version: 1,
        reason: null,
      });

    // Act
    const fromRejected = await similar(setup, report);
    const fromRequirement = await similar(setup, req);

    // Assert
    expect(fromRejected.items.map(item => item.key)).toEqual([req]);
    expect(fromRequirement.items).toEqual([]);
  });

  it('says Similar Items are unavailable while the Workspace has no Provider Key', async () => {
    // Arrange
    const setup = await setUp({ withKey: false });
    const req = await record(setup, requirement);

    // Act
    const found = await similar(setup, req);

    // Assert
    expect(found).toEqual({ items: [], available: false });
    expect(embedded).toEqual([]);
  });
});
