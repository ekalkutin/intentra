import { randomUUID } from 'node:crypto';

export abstract class EntityId {
  /**
   * `#`, а не `protected`: значение идентичности не читает и не подменяет ни
   * один наследник — они лишь добавляют тип-бренд. Так его не подменит никто и
   * впредь, причём в рантайме, а не по договорённости.
   */
  readonly #value: string;

  constructor(value?: string) {
    const resolved = value ?? randomUUID();
    this.validate(resolved);
    this.#value = resolved;
  }

  /**
   * `protected`, потому что это точка расширения: наследник, которому нужен
   * формат строже непустой строки, переопределяет её. Приватным именем такой
   * перегрузки не бывает — база звала бы свою.
   */
  protected validate(value: string): void {
    if (!value) {
      throw new Error('EntityId cannot be empty');
    }
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: this): boolean {
    return other.value === this.#value;
  }

  public toJSON(): string {
    return this.#value;
  }

  public toString(): string {
    return this.#value;
  }
}
