import type {
  DecisionFieldsDto,
  EditKnowledgeItemDto,
  RequirementFieldsDto,
  TermFieldsDto,
} from '@intentra/contracts/workspace';

import {
  DecisionContent,
  RequirementContent,
  TermContent,
  type KnowledgeContent,
} from '../../domain/value-objects/index.js';

export type KnowledgeFieldsInput =
  | { readonly kind: 'term'; readonly fields: TermFieldsDto }
  | { readonly kind: 'requirement'; readonly fields: RequirementFieldsDto }
  | { readonly kind: 'decision'; readonly fields: DecisionFieldsDto };

export function toKnowledgeContent(
  input: KnowledgeFieldsInput,
): KnowledgeContent {
  switch (input.kind) {
    case 'term':
      return new TermContent(input.fields);
    case 'requirement':
      return new RequirementContent(input.fields);
    case 'decision':
      return new DecisionContent(input.fields);
  }
}

/** The new content of an edited Draft, or undefined when its fields stay. */
export function toChangedKnowledgeContent(
  data: EditKnowledgeItemDto,
): KnowledgeContent | undefined {
  switch (data.kind) {
    case 'term':
      return data.fields && new TermContent(data.fields);
    case 'requirement':
      return data.fields && new RequirementContent(data.fields);
    case 'decision':
      return data.fields && new DecisionContent(data.fields);
  }
}
