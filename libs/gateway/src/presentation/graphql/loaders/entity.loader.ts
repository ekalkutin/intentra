import DataLoader from 'dataloader';

type BatchFn<T> = (ids: readonly string[]) => Promise<readonly T[]>;

/**
 * Batches by id and restores the requested order, since a batch call returns
 * only the rows that exist and in whatever order the source produced them.
 * Subclasses are request-scoped: the cache lives for one GraphQL request.
 */
export abstract class EntityLoader<T extends { id: string }> {
  readonly #loader: DataLoader<string, T | null>;

  protected constructor(batch: BatchFn<T>) {
    this.#loader = new DataLoader(async ids => {
      const rows = await batch(ids);
      const byId = new Map(rows.map(row => [row.id, row]));

      return ids.map(id => byId.get(id) ?? null);
    });
  }

  public load(id: string): Promise<T | null> {
    return this.#loader.load(id);
  }

  /** Drops ids that resolved to nothing, so callers get a dense list. */
  public async loadMany(ids: readonly string[]): Promise<T[]> {
    const results = await this.#loader.loadMany(ids);

    return results.filter(
      (result): result is T => result !== null && !(result instanceof Error),
    );
  }
}
