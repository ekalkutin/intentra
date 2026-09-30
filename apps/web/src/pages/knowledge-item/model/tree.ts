import type {
  KnowledgeDependenciesDto,
  KnowledgeDependencyDto,
} from '@intentra/contracts/workspace';

export type TreeRow = {
  readonly item: KnowledgeDependencyDto;
  /** 0 for the item itself. */
  readonly depth: number;
  /** Already shown above: its own dependencies are not repeated. */
  readonly repeat: boolean;
};

/**
 * The `depends-on` cascade as an indented tree from the item, each item's
 * dependencies expanded once; a cycle or a shared dependency shows again as a
 * repeat.
 */
export function dependencyTree(
  rootKey: string,
  dependencies: KnowledgeDependenciesDto,
): TreeRow[] {
  const byKey = new Map(dependencies.items.map(item => [item.key, item]));
  const children = new Map<string, string[]>();
  for (const { from, to } of dependencies.links) {
    children.set(from, [...(children.get(from) ?? []), to]);
  }
  const rows: TreeRow[] = [];
  const expanded = new Set<string>();
  const walk = (key: string, depth: number) => {
    const item = byKey.get(key);
    if (!item) {
      return;
    }
    const repeat = expanded.has(key);
    rows.push({ item, depth, repeat });
    if (repeat) {
      return;
    }
    expanded.add(key);
    for (const child of children.get(key) ?? []) {
      walk(child, depth + 1);
    }
  };
  walk(rootKey, 0);

  return rows;
}
