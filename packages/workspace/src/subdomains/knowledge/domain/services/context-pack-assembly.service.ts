import { KnowledgeItem } from '../entities/index.js';
import { ContextPackRole, KnowledgeKind } from '../value-objects/index.js';

/** An Approved item found on the way from the Anchors, for one reason. */
export type ContextPackCandidate = {
  readonly item: KnowledgeItem;
  readonly role: ContextPackRole;
  /** Steps from the nearest Anchor along the Links, 0 for an Anchor. */
  readonly distance: number;
};

/** An item of a Context Pack, once, under the role it ended with. */
export type ContextPackEntry = ContextPackCandidate & {
  /** False: past the budget, shown by key, Kind, title and main field only. */
  readonly inFull: boolean;
};

export class ContextPackAssemblyService {
  /**
   * Keeps each item once, under its first role and nearest distance; drops
   * nothing. Anchors, conflicts, Open Questions, rules and items under review
   * are always in full; the rest in full nearest first while fewer than `budget`
   * items are, then brief. Anchors first, then by role, distance and key.
   */
  public assemble(
    candidates: readonly ContextPackCandidate[],
    budget: number,
  ): ContextPackEntry[] {
    const kept = new Map<string, ContextPackCandidate>();
    for (const candidate of candidates) {
      const key = candidate.item.key.value;
      const held = kept.get(key);
      kept.set(key, held ? stronger(held, candidate) : candidate);
    }
    const ordered = [...kept.values()].sort(byPlace);
    const mustBeFull = (candidate: ContextPackCandidate) =>
      candidate.role.alwaysInFull || candidate.item.needsReview();
    let full = ordered.filter(mustBeFull).length;
    const inFull = new Set<ContextPackCandidate>(ordered.filter(mustBeFull));
    for (const candidate of [...ordered].sort(byNearness)) {
      if (full >= budget) break;
      if (!inFull.has(candidate)) {
        inFull.add(candidate);
        full++;
      }
    }

    return ordered.map(candidate => ({
      ...candidate,
      inFull: inFull.has(candidate),
    }));
  }
}

function stronger(
  held: ContextPackCandidate,
  found: ContextPackCandidate,
): ContextPackCandidate {
  const role = found.role.rank < held.role.rank ? found.role : held.role;

  return {
    item: held.item,
    role,
    distance: Math.min(held.distance, found.distance),
  };
}

function byPlace(a: ContextPackCandidate, b: ContextPackCandidate): number {
  return (
    a.role.rank - b.role.rank ||
    a.distance - b.distance ||
    byKey(a.item, b.item)
  );
}

/** What fills the budget first: the nearest, then by role and key. */
function byNearness(a: ContextPackCandidate, b: ContextPackCandidate): number {
  return (
    a.distance - b.distance ||
    a.role.rank - b.role.rank ||
    byKey(a.item, b.item)
  );
}

function byKey(a: KnowledgeItem, b: KnowledgeItem): number {
  return (
    KnowledgeKind.all.indexOf(a.kind) - KnowledgeKind.all.indexOf(b.kind) ||
    a.key.number - b.key.number
  );
}
