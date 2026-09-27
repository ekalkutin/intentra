import { Aggregate, WorkspaceId } from '@intentra/shared';

export type WorkspaceProps = {
  readonly name: string;
};

export class Workspace extends Aggregate<WorkspaceId> {
  #name: string;

  private constructor(id: WorkspaceId, name: string) {
    super(id);
    this.#name = name;
  }

  get name(): string {
    return this.#name;
  }

  public static create(props: WorkspaceProps): Workspace {
    const workspace = new Workspace(new WorkspaceId(), props.name);
    return workspace;
  }
  public static reconstitute(
    id: WorkspaceId,
    props: WorkspaceProps,
  ): Workspace {
    return new Workspace(id, props.name);
  }
}
