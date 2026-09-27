export type CatalogModel = {
  readonly id: string;
  readonly name: string;
  readonly contextLength: number | null;
};

/** The models the provider offers right now. */
export abstract class ModelCatalog {
  abstract find(): Promise<readonly CatalogModel[]>;
}
