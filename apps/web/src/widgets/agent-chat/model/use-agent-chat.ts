import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useMemo } from 'react';

import { API_URL } from '@/shared/config';
import { readAccessToken } from '@/shared/session';

const FALLBACK_ERROR = 'Could not reach the agents. Try again.';

/**
 * A refusal before the answer starts (no key, not a member) comes as the
 * gateway's JSON error, which `useChat` hands over as the message text.
 */
export const describeChatError = (error: Error): string => {
  try {
    const { message } = JSON.parse(error.message) as { message?: unknown };
    return typeof message === 'string' ? message : FALLBACK_ERROR;
  } catch {
    return error.message || FALLBACK_ERROR;
  }
};

/** The chat with the orchestrator; the conversation lives only in this tab. */
export const useAgentChat = (workspaceId: string) => {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_URL}/workspaces/${workspaceId}/chat`,
        headers: (): Record<string, string> => {
          const token = readAccessToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    [workspaceId],
  );

  return useChat({ id: workspaceId, transport });
};
