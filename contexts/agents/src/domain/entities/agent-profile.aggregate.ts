import { Aggregate, Timestamp, WorkspaceId } from '@intentra/shared';

import {
  AgentProfileArchivedException,
  OrchestratorCannotBeArchivedException,
} from '../exceptions/index.js';
import {
  AgentDescription,
  AgentName,
  AgentProfileId,
  AgentRole,
  Instructions,
  ModelId,
  ToolId,
} from '../value-objects/index.js';

export type AgentProfileProps = {
  readonly workspaceId: WorkspaceId;
  readonly role: AgentRole;
  readonly name: AgentName;
  readonly description: AgentDescription;
  readonly instructions: Instructions;
  readonly model: ModelId;
  readonly tools: readonly ToolId[];
  readonly archivedAt: Timestamp | null;
};

export type CreateSpecialistProps = Pick<
  AgentProfileProps,
  'workspaceId' | 'name' | 'description' | 'instructions' | 'model'
>;

export type CreateOrchestratorProps = Pick<
  AgentProfileProps,
  'workspaceId' | 'model'
>;

const ORCHESTRATOR_NAME = new AgentName('Orchestrator');
const ORCHESTRATOR_DESCRIPTION = new AgentDescription(
  'Talks to the members of the workspace and delegates to its agents.',
);
const ORCHESTRATOR_INSTRUCTIONS = new Instructions(
  [
    'You are the orchestrator of an Intentra workspace. You talk to its members.',
    'The workspace has specialist agents; each one is described to you.',
    'When a request fits a specialist, delegate it with a clear, self-contained task',
    'and pass the answer on. Answer simple questions yourself.',
  ].join(' '),
);

/**
 * An agent configured by a workspace: who it is, how it is instructed, which
 * model it runs on and which tools it may use. Every workspace has one
 * orchestrator, which cannot be deleted, and any number of specialists.
 */
export class AgentProfile extends Aggregate<AgentProfileId> {
  readonly #workspaceId: WorkspaceId;
  readonly #role: AgentRole;
  #name: AgentName;
  #description: AgentDescription;
  #instructions: Instructions;
  #model: ModelId;
  #tools: ToolId[];
  #archivedAt: Timestamp | null;

  private constructor(id: AgentProfileId, props: AgentProfileProps) {
    super(id);
    this.#workspaceId = props.workspaceId;
    this.#role = props.role;
    this.#name = props.name;
    this.#description = props.description;
    this.#instructions = props.instructions;
    this.#model = props.model;
    this.#tools = [...props.tools];
    this.#archivedAt = props.archivedAt;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get role(): AgentRole {
    return this.#role;
  }

  get name(): AgentName {
    return this.#name;
  }

  get description(): AgentDescription {
    return this.#description;
  }

  get instructions(): Instructions {
    return this.#instructions;
  }

  get model(): ModelId {
    return this.#model;
  }

  get tools(): readonly ToolId[] {
    return [...this.#tools];
  }

  get archivedAt(): Timestamp | null {
    return this.#archivedAt;
  }

  get isArchived(): boolean {
    return this.#archivedAt !== null;
  }

  public rename(name: AgentName): void {
    this.#assertNotArchived();
    this.#name = name;
  }

  public describe(description: AgentDescription): void {
    this.#assertNotArchived();
    this.#description = description;
  }

  public changeInstructions(instructions: Instructions): void {
    this.#assertNotArchived();
    this.#instructions = instructions;
  }

  public changeModel(model: ModelId): void {
    this.#assertNotArchived();
    this.#model = model;
  }

  public allowTool(tool: ToolId): void {
    this.#assertNotArchived();
    if (!this.#tools.some(allowed => allowed.equals(tool))) {
      this.#tools.push(tool);
    }
  }

  /** Sets the allowed tools to exactly this list, without duplicates. */
  public replaceTools(tools: readonly ToolId[]): void {
    this.#assertNotArchived();
    this.#tools = tools.filter(
      (tool, index) => tools.findIndex(other => other.equals(tool)) === index,
    );
  }

  public revokeTool(tool: ToolId): void {
    this.#assertNotArchived();
    this.#tools = this.#tools.filter(allowed => !allowed.equals(tool));
  }

  public archive(): void {
    this.#assertNotArchived();
    if (this.#role.isOrchestrator) {
      throw new OrchestratorCannotBeArchivedException();
    }
    this.#archivedAt = Timestamp.now();
  }

  #assertNotArchived(): void {
    if (this.isArchived) {
      throw new AgentProfileArchivedException(this.id);
    }
  }

  public static createSpecialist(props: CreateSpecialistProps): AgentProfile {
    return new AgentProfile(new AgentProfileId(), {
      ...props,
      role: AgentRole.SPECIALIST,
      tools: [],
      archivedAt: null,
    });
  }

  /** With default wording; the workspace changes it later as it likes. */
  public static createOrchestrator(
    props: CreateOrchestratorProps,
  ): AgentProfile {
    return new AgentProfile(new AgentProfileId(), {
      ...props,
      role: AgentRole.ORCHESTRATOR,
      name: ORCHESTRATOR_NAME,
      description: ORCHESTRATOR_DESCRIPTION,
      instructions: ORCHESTRATOR_INSTRUCTIONS,
      tools: [],
      archivedAt: null,
    });
  }

  public static reconstitute(
    id: AgentProfileId,
    props: AgentProfileProps,
  ): AgentProfile {
    return new AgentProfile(id, props);
  }
}
