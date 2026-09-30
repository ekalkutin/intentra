export type IssuedSecret = {
  /** Shown to the Member once and never stored. */
  readonly secret: string;
  readonly hash: string;
  /** A piece of the secret that is safe to show, such as `intr_…x7Qa`. */
  readonly hint: string;
};

/** Makes and hashes the secrets of Personal Access Tokens. */
export abstract class PersonalAccessTokenSecrets {
  abstract issue(): IssuedSecret;
  abstract hash(secret: string): string;
}
