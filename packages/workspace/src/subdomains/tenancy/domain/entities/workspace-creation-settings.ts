import { WorkspaceCreationClosedException } from '../exceptions/index.js';

/** Open Workspace Creation: whether anyone may create a Workspace. Off until a Platform Admin turns it on. */
export class WorkspaceCreationSettings {
  #open: boolean;

  private constructor(open: boolean) {
    this.#open = open;
  }

  /** Off: only a Platform Admin may create a Workspace. */
  get isOpen(): boolean {
    return this.#open;
  }

  /** How things stand before a Platform Admin has ever turned it on. */
  public static closed(): WorkspaceCreationSettings {
    return new WorkspaceCreationSettings(false);
  }

  public static restore(
    props: WorkspaceCreationSettingsRestoreProps,
  ): WorkspaceCreationSettings {
    return new WorkspaceCreationSettings(props.open);
  }

  public open(): void {
    this.#open = true;
  }

  public close(): void {
    this.#open = false;
  }

  /** While it is off, only a Platform Admin may create a Workspace. */
  public ensureAllows(isPlatformAdmin: boolean): void {
    if (!this.#open && !isPlatformAdmin) {
      throw new WorkspaceCreationClosedException();
    }
  }
}

type WorkspaceCreationSettingsRestoreProps = {
  readonly open: boolean;
};
