import type { Actor } from '@intentra/contracts/iam';
import type {
  ConversationsApi,
  SendMessageDto,
} from '@intentra/contracts/workspace';

import type { Project, ProjectRole } from '../../../../tenancy/index.js';
import type {
  AgentsContent,
  Conversation,
} from '../../../domain/entities/index.js';
import type {
  AgentsVersionNumber,
  ProviderKeySecret,
} from '../../../domain/value-objects/index.js';

/** Intentra's answer as the client reads it. */
export type AnswerStream = Awaited<ReturnType<ConversationsApi['send']>>;

export type IntentraQuestion = {
  readonly conversation: Conversation;
  readonly actor: Actor;
  readonly project: Project;
  /** The Member's own Project Role; Intentra works at most as a Contributor. */
  readonly projectRole: ProjectRole;
  readonly message: SendMessageDto['message'];
  /** The Workspace's key; every model call of the answer runs on it. */
  readonly providerKey: ProviderKeySecret;
  /** The Agents that answer; they hold Intentra and could be published. */
  readonly agents: AgentsContent;
  /** Their Agents Version; null for the Unpublished Agents, in a Platform Admin's own Conversation. */
  readonly agentsVersion: AgentsVersionNumber | null;
};

export type IntentraAnswer = {
  readonly stream: AnswerStream;
  /** Resolves once the answer has run to the end and is kept, read or not; never rejects. */
  readonly done: Promise<void>;
};

/** Intentra's Intentra and its Specialists, run by the Agents' runtime as given. */
export abstract class Intentra {
  abstract answer(question: IntentraQuestion): Promise<IntentraAnswer>;
}
