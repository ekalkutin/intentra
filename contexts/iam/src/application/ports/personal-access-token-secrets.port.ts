/** Makes the secret of a personal access token and the hash it is found by. */
export abstract class PersonalAccessTokenSecrets {
  abstract generate(): string;
  abstract hash(secret: string): string;
}
