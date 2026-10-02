import { Injectable, type Provider } from '@nestjs/common';

import { intentraCaller } from '@intentra/contracts/workspace';

import { KnowledgeService } from '../../../../knowledge/index.js';
import type { Project } from '../../../../tenancy/index.js';
import {
  KnowledgeChangesReader,
  type KnowledgeChanges,
} from '../../../application/ports/outbound/index.js';

/** Asks Knowledge through its published API, as Intentra itself. */
@Injectable()
export class KnowledgeChangesAdapter implements KnowledgeChangesReader {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  public since(
    project: Project,
    moment: Temporal.Instant,
  ): Promise<KnowledgeChanges> {
    return this.knowledgeService.changes(
      intentraCaller(project.id.value),
      project.workspaceId.value,
      project.id.value,
      { since: moment.toString() },
    );
  }
}

export const KNOWLEDGE_CHANGES_PROVIDER: Provider = {
  provide: KnowledgeChangesReader,
  useClass: KnowledgeChangesAdapter,
};
