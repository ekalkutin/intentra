/** Уровень, на котором действует право или владение. */
export type ScopeType = 'platform' | 'workspace' | 'project';

/**
 * Область действия права или владения.
 *
 * Хранится парой «тип области + идентификатор», а не колонкой на каждый уровень:
 * новый уровень или новый вид объекта добавляется данными, а не миграцией модели
 * (ADR 0002).
 */
export class Scope {
  readonly #type: ScopeType;
  readonly #id: string | null;

  private constructor(type: ScopeType, id: string | null) {
    if (type !== 'platform' && !id) {
      throw new Error(`Scope of type "${type}" requires an identifier`);
    }

    this.#type = type;
    this.#id = id;
  }

  public get type(): ScopeType {
    return this.#type;
  }

  /** `null` только у платформы: у неё нет экземпляра, которым её можно назвать. */
  public get id(): string | null {
    return this.#id;
  }

  public equals(other: Scope): boolean {
    return other.type === this.#type && other.id === this.#id;
  }

  public toString(): string {
    return this.#id === null ? this.#type : `${this.#type}:${this.#id}`;
  }

  public static platform(): Scope {
    return new Scope('platform', null);
  }

  public static workspace(id: string): Scope {
    return new Scope('workspace', id);
  }

  public static project(id: string): Scope {
    return new Scope('project', id);
  }

  public static of(type: ScopeType, id: string | null): Scope {
    return new Scope(type, id);
  }
}
