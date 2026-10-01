import type {
  ConversationDto,
  ConversationPageDto,
  ConversationWithMessagesDto,
} from '@intentra/contracts/workspace';

import type { Conversation } from '../../domain/entities/index.js';
import type {
  ConversationMessage,
  ConversationPage,
} from '../ports/outbound/index.js';

import { toIsoString } from './instant.mapper.js';

export function toConversationDto(conversation: Conversation): ConversationDto {
  return {
    id: conversation.id.value,
    title: conversation.title?.value ?? null,
    hidden: conversation.hidden,
    createdAt: toIsoString(conversation.createdAt),
    updatedAt: toIsoString(conversation.updatedAt),
  };
}

export function toConversationWithMessagesDto(
  conversation: Conversation,
  messages: readonly ConversationMessage[],
): ConversationWithMessagesDto {
  return { ...toConversationDto(conversation), messages };
}

export function toConversationPageDto({
  items,
  total,
}: ConversationPage): ConversationPageDto {
  return { items: items.map(toConversationDto), total };
}
