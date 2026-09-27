/** An API key as it is stored: encrypted, with the hint shown in its place. */
export class EncryptedApiKey {
  constructor(
    public readonly ciphertext: string,
    public readonly hint: string,
  ) {}
}
