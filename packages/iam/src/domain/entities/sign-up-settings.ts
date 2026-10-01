import { SignUpClosedException } from '../exceptions/index.js';

/** Open Sign-up: whether anyone may create an Account. Off until a Platform Admin turns it on. */
export class SignUpSettings {
  #open: boolean;

  private constructor(open: boolean) {
    this.#open = open;
  }

  /** Off: only an invited email may sign up. */
  get isOpen(): boolean {
    return this.#open;
  }

  /** How things stand before a Platform Admin has ever turned it on. */
  public static closed(): SignUpSettings {
    return new SignUpSettings(false);
  }

  public static restore(props: SignUpSettingsRestoreProps): SignUpSettings {
    return new SignUpSettings(props.open);
  }

  public open(): void {
    this.#open = true;
  }

  public close(): void {
    this.#open = false;
  }

  /** While it is off, only someone with a pending Invitation may sign up. */
  public ensureAllows(invited: boolean): void {
    if (!this.#open && !invited) {
      throw new SignUpClosedException();
    }
  }
}

type SignUpSettingsRestoreProps = {
  readonly open: boolean;
};
