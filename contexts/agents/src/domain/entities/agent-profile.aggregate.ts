import { Aggregate, WorkspaceId } from '@intentra/shared';

import { AgentProfileArchivedError } from '../errors/agent-profile-archived.error.js';
import { AgentName } from '../value-objects/agent-name.vo.js';
import { AgentProfileId } from '../value-objects/agent-profile-id.vo.js';
import { Instructions } from '../value-objects/instructions.vo.js';
import { ModelRef } from '../value-objects/model-ref.vo.js';
import { ToolId } from '../value-objects/tool-id.vo.js';

export type AgentProfileProps = {
  readonly workspaceId: WorkspaceId;
  readonly name: AgentName;
  readonly instructions: Instructions;
  readonly model: ModelRef;
  readonly tools: readonly ToolId[];
  readonly archivedAt: Date | null;
};

export type CreateAgentProfileProps = Pick<
  AgentProfileProps,
  'workspaceId' | 'name' | 'instructions' | 'model'
>;

/**
 * An agent configured by a workspace: who it is, how it is instructed, which
 * model it runs on and which tools it may use. Belongs to the whole workspace;
 * projects decide later which profiles they use.
 */
export class AgentProfile extends Aggregate<AgentProfileId> {
  readonly #workspaceId: WorkspaceId;
  #name: AgentName;
  #instructions: Instructions;
  #model: ModelRef;
  #tools: ToolId[];
  #archivedAt: Date | null;

  private constructor(id: AgentProfileId, props: AgentProfileProps) {
    super(id);
    this.#workspaceId = props.workspaceId;
    this.#name = props.name;
    this.#instructions = props.instructions;
    this.#model = props.model;
    this.#tools = [...props.tools];
    this.#archivedAt = props.archivedAt;
  }

  public static create(props: CreateAgentProfileProps): AgentProfile {
    return new AgentProfile(new AgentProfileId(), {
      ...props,
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

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get name(): AgentName {
    return this.#name;
  }

  get instructions(): Instructions {
    return this.#instructions;
  }

  get model(): ModelRef {
    return this.#model;
  }

  get tools(): readonly ToolId[] {
    return [...this.#tools];
  }

  get archivedAt(): Date | null {
    return this.#archivedAt;
  }

  get isArchived(): boolean {
    return this.#archivedAt !== null;
  }

  public rename(name: AgentName): void {
    this.#assertNotArchived();
    this.#name = name;
  }

  public changeInstructions(instructions: Instructions): void {
    this.#assertNotArchived();
    this.#instructions = instructions;
  }

  public changeModel(model: ModelRef): void {
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
    this.#archivedAt = new Date();
  }

  #assertNotArchived(): void {
    if (this.isArchived) {
      throw new AgentProfileArchivedError(this.id);
    }
  }
}
