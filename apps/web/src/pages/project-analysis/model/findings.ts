import {
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

/** One Open Question a run recorded, with what it asks and what became of it, when it is still there. */
export type Finding = {
  readonly key: string;
  /** Null when the Draft was deleted since. */
  readonly title: string | null;
  readonly status: KnowledgeStatusDto | null;
};

/** The run's findings in the order it recorded them, joined with the Project's Open Questions. */
export function findingsOf(
  keys: readonly string[],
  questions: readonly KnowledgeItemDto[],
): Finding[] {
  return keys.map(key => {
    const question = questions.find(item => item.key === key);

    return {
      key,
      title: question?.title ?? null,
      status: question?.status ?? null,
    };
  });
}

/** How many still wait for a person's decision. */
export function waitingCount(findings: readonly Finding[]): number {
  return findings.filter(
    finding => finding.status === KnowledgeStatusDtoSchema.enum.draft,
  ).length;
}
