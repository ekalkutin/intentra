import type { Actor } from '@intentra/contracts/iam';
import type {
  ConversationsApi,
  SendMessageDto,
} from '@intentra/contracts/workspace';

import type { Project, ProjectRole } from '../../../../tenancy/index.js';
import type { Conversation } from '../../../domain/entities/index.js';
import type { ProviderKeySecret } from '../../../domain/value-objects/index.js';

/** The Orchestrator's answer as the client reads it. */
export type AnswerStream = Awaited<ReturnType<ConversationsApi['send']>>;

export type OrchestratorQuestion = {
  readonly conversation: Conversation;
  readonly actor: Actor;
  readonly project: Project;
  /** The Member's own Project Role; the Orchestrator works at most as a Contributor. */
  readonly projectRole: ProjectRole;
  readonly message: SendMessageDto['message'];
  /** The Workspace's key; every model call of the answer runs on it. */
  readonly providerKey: ProviderKeySecret;
};

export type OrchestratorAnswer = {
  readonly stream: AnswerStream;
  /** Resolves once the answer has run to the end and is kept, read or not; never rejects. */
  readonly done: Promise<void>;
};

/** Intentra's Orchestrator, run by the Agents' runtime on a model. */
export abstract class Orchestrator {
  abstract answer(question: OrchestratorQuestion): Promise<OrchestratorAnswer>;
}
