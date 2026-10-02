import {
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeLinkDto,
  type KnowledgeLinkTypeDto,
} from '@intentra/contracts/workspace';

export type LinkGroup = {
  readonly type: KnowledgeLinkTypeDto;
  readonly keys: string[];
};

const CURRENT: readonly string[] = [
  KnowledgeStatusDtoSchema.enum.draft,
  KnowledgeStatusDtoSchema.enum.approved,
];

/** Links by their type, in the model's order of types; empty types left out. */
export function groupLinks(links: readonly KnowledgeLinkDto[]): LinkGroup[] {
  return KnowledgeLinkTypeDtoSchema.options
    .map(type => ({
      type,
      keys: links.filter(link => link.type === type).map(link => link.key),
    }))
    .filter(group => group.keys.length > 0);
}

/**
 * The current items (Drafts and Approved) that link to a Knowledge Key, by
 * the type of their Link; Rejected and Obsolete items no longer say anything.
 */
export function incomingLinks(
  key: string,
  items: readonly KnowledgeItemDto[],
): LinkGroup[] {
  return groupLinks(
    items
      .filter(item => CURRENT.includes(item.status))
      .flatMap(item =>
        item.links
          .filter(link => link.key === key)
          .map(link => ({ type: link.type, key: item.key })),
      ),
  );
}

/** The Drafts that answer an Open Question: answers proposed, not yet in force. */
export function proposedAnswers(
  key: string,
  items: readonly KnowledgeItemDto[],
): KnowledgeItemDto[] {
  return items.filter(
    item =>
      item.status === KnowledgeStatusDtoSchema.enum.draft &&
      item.links.some(
        link =>
          link.type === KnowledgeLinkTypeDtoSchema.enum.answers &&
          link.key === key,
      ),
  );
}
