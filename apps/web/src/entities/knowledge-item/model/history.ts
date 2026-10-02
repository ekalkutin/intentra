import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

/** What happened to a Knowledge Item; each happens at most once. */
export const HISTORY_EVENTS = {
  recorded: 'recorded',
  edited: 'edited',
  approved: 'approved',
  rejected: 'rejected',
  superseded: 'superseded',
  retired: 'retired',
} as const;

export type HistoryEventType =
  (typeof HISTORY_EVENTS)[keyof typeof HISTORY_EVENTS];

export type HistoryEvent = {
  readonly type: HistoryEventType;
  /** The Member who did it; null when Intentra itself recorded it, in an Analysis Run. */
  readonly memberId: string | null;
  /** ISO 8601 */
  readonly at: string;
};

/** A Knowledge Item's history, oldest first, from the fields its lifecycle records. */
export function historyOf(item: KnowledgeItemDto): HistoryEvent[] {
  const events: (HistoryEvent | null)[] = [
    {
      type: HISTORY_EVENTS.recorded,
      memberId: item.authorId,
      at: item.recordedAt,
    },
    item.lastEditedBy && item.lastEditedAt
      ? {
          type: HISTORY_EVENTS.edited,
          memberId: item.lastEditedBy,
          at: item.lastEditedAt,
        }
      : null,
    item.approvedBy && item.approvedAt
      ? {
          type: HISTORY_EVENTS.approved,
          memberId: item.approvedBy,
          at: item.approvedAt,
        }
      : null,
    item.rejectedBy && item.rejectedAt
      ? {
          type: HISTORY_EVENTS.rejected,
          memberId: item.rejectedBy,
          at: item.rejectedAt,
        }
      : null,
    item.supersededBy && item.supersededAt
      ? {
          type: HISTORY_EVENTS.superseded,
          memberId: item.supersededBy,
          at: item.supersededAt,
        }
      : null,
    item.retiredBy && item.retiredAt
      ? {
          type: HISTORY_EVENTS.retired,
          memberId: item.retiredBy,
          at: item.retiredAt,
        }
      : null,
  ];

  return events
    .filter(event => event !== null)
    .sort((a, b) => a.at.localeCompare(b.at));
}
