import { SignUpSettings } from '../../../domain/entities/index.js';

/** Holds the one Open Sign-up setting. */
export abstract class SignUpSettingsRepository {
  abstract save(settings: SignUpSettings): Promise<void>;
  /** Null until a Platform Admin first sets it. */
  abstract findOne(): Promise<SignUpSettings | null>;

  /** Off until a Platform Admin turns it on. */
  public async getOne(): Promise<SignUpSettings> {
    return (await this.findOne()) ?? SignUpSettings.closed();
  }
}
