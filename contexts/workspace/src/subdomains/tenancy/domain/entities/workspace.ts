import { Aggregate, WorkspaceId } from '@intentra/shared';

import { WorkspaceCreatedEvent } from '../events/index.js';
import { WorkspaceName } from '../value-objects/workspace-name.vo.js';

export type CreateProps = {
  readonly name: string;
};

export type ReconstituteProps = CreateProps & {
  readonly id: string;
  readonly createdAt: Date;
};

/**
 * Граница тенанта: всё, что внутри, принадлежит ему и не видно снаружи.
 *
 * Владельца в себе не держит: кто владелец — это выданное право, и живёт оно
 * в `RoleAssignment`. Иначе владение выражалось бы дважды и рано или поздно
 * разошлось.
 */
export class Workspace extends Aggregate<WorkspaceId> {
  #name: WorkspaceName;
  readonly #createdAt: Date;

  private constructor(id: WorkspaceId, name: WorkspaceName, createdAt: Date) {
    super(id);
    this.#name = name;
    this.#createdAt = createdAt;
  }

  get name(): string {
    return this.#name.value;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  public rename(name: string): void {
    this.#name = new WorkspaceName(name);
  }

  public static create(props: CreateProps): Workspace {
    const workspace = new Workspace(
      new WorkspaceId(),
      new WorkspaceName(props.name),
      new Date(),
    );

    workspace.apply(
      new WorkspaceCreatedEvent(workspace.id.toString(), workspace.name),
    );

    return workspace;
  }

  public static reconstitute(props: ReconstituteProps): Workspace {
    return new Workspace(
      new WorkspaceId(props.id),
      new WorkspaceName(props.name),
      props.createdAt,
    );
  }
}
