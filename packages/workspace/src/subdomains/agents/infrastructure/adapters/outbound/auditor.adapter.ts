import { Inject, Injectable, type Provider } from '@nestjs/common';

import {
  createAuditor,
  judge,
  type AuditedItem,
} from '@intentra/agent-toolkit';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { ModelUnavailableException } from '../../../application/exceptions/index.js';
import {
  Auditor,
  type AuditFinding,
  type AuditJudgement,
} from '../../../application/ports/outbound/index.js';
import {
  AGENTS_OPTIONS,
  toAgentDefinition,
  type AgentsOptions,
} from '../../runtime/index.js';

/**
 * Runs the Auditor from `@intentra/agent-toolkit` on the Agents given, its
 * Model Profile and the Workspace's Provider Key: one model call per group,
 * with no tools (Agents ADR 0005).
 */
@Injectable()
export class AuditorAdapter implements Auditor {
  constructor(
    @Inject(AGENTS_OPTIONS) private readonly options: AgentsOptions,
  ) {}

  public async judge({
    project,
    agents,
    providerKey,
    group,
  }: AuditJudgement): Promise<AuditFinding[]> {
    const auditorAgent = agents.auditor();
    if (!auditorAgent) {
      throw new Error('The Agents to run hold no Auditor');
    }
    const auditor = createAuditor({
      auditor: toAgentDefinition(
        this.options,
        agents,
        auditorAgent,
        providerKey,
      ),
      project: { name: project.name.value },
    });
    try {
      return await judge(
        auditor,
        {
          item: toAuditedItem(group.item),
          around: group.around.map(toAuditedItem),
          questions: group.questions.map(toAuditedItem),
        },
        {
          maxRetries: this.options.auditMaxRetries,
          abortSignal: AbortSignal.timeout(this.options.auditTimeoutMs),
        },
      );
    } catch (error) {
      if (isProviderOutage(error)) {
        throw new ModelUnavailableException();
      }
      throw error;
    }
  }
}

function toAuditedItem(item: KnowledgeItemDto): AuditedItem {
  return {
    key: item.key,
    kind: item.kind,
    status: item.status,
    title: item.title,
    fields: item.fields,
    links: item.links,
  };
}

export const AUDITOR_PROVIDER: Provider = {
  provide: Auditor,
  useClass: AuditorAdapter,
};

/** Statuses a provider answers when it cannot serve the call for now. */
const OUTAGE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Whether the model's provider failed for a while rather than the Auditor:
 * the AI SDK marks such a call retryable, perhaps under Mastra's own errors.
 */
function isProviderOutage(error: unknown): boolean {
  for (let cause = error; cause instanceof Error; cause = cause.cause) {
    if (
      ('isRetryable' in cause && cause.isRetryable === true) ||
      ('statusCode' in cause &&
        typeof cause.statusCode === 'number' &&
        OUTAGE_STATUSES.has(cause.statusCode))
    ) {
      return true;
    }
  }

  return false;
}
