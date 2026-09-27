/** Which LLM an agent runs on: the provider and the model name it knows. */
export class ModelRef {
  readonly #provider: string;
  readonly #name: string;

  constructor(provider: string, name: string) {
    const trimmedProvider = provider.trim();
    const trimmedName = name.trim();
    if (!trimmedProvider) {
      throw new Error('Model provider cannot be empty');
    }
    if (!trimmedName) {
      throw new Error('Model name cannot be empty');
    }
    this.#provider = trimmedProvider;
    this.#name = trimmedName;
  }

  public get provider(): string {
    return this.#provider;
  }

  public get name(): string {
    return this.#name;
  }

  public equals(other: ModelRef): boolean {
    return other.provider === this.#provider && other.name === this.#name;
  }
}
