import {
  createAsyncThunk,
  createSlice,
  nanoid,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { API_BASE, baseApi, refreshTokens } from '@/api/base-api';
import type { AppDispatch, RootState } from '@/app/store';
import { readStored } from '@/lib/storage';
import type {
  ChatEventDto,
  ChatMessageDto,
} from '@intentra/contracts/workspace';

export const CHAT_STORAGE_KEY = 'intentra.chat';

export type ToolPart = {
  readonly type: 'tool';
  readonly toolCallId: string;
  readonly toolName: string;
  readonly args: unknown;
  readonly result?: unknown;
  readonly isError?: boolean;
  readonly done: boolean;
};

export type MessagePart = { readonly type: 'text'; text: string } | ToolPart;

export type ChatMessage = {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  parts: MessagePart[];
  readonly createdAt: string;
  error?: string;
};

export type Conversation = {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  title: string;
  readonly createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type ChatState = {
  conversations: Record<string, Conversation>;
  /** The assistant message being streamed, if any. */
  streaming: { conversationId: string; messageId: string } | null;
};

const initialState = (): ChatState => ({
  conversations: readStored<Record<string, Conversation>>(CHAT_STORAGE_KEY, {}),
  streaming: null,
});

/** Tools whose success changes a Project's knowledge. */
const WRITING_TOOL = /^(record_|edit_|delete_|confirm_)/;

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    conversationStarted: (
      state,
      {
        payload,
      }: PayloadAction<{ id: string; workspaceId: string; projectId: string }>,
    ) => {
      const now = new Date().toISOString();
      state.conversations[payload.id] = {
        ...payload,
        title: 'Новый разговор',
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
    },
    conversationDeleted: (state, { payload }: PayloadAction<string>) => {
      delete state.conversations[payload];
    },
    messageAdded: (
      state,
      {
        payload,
      }: PayloadAction<{ conversationId: string; message: ChatMessage }>,
    ) => {
      const conversation = state.conversations[payload.conversationId];
      if (!conversation) return;
      conversation.messages.push(payload.message);
      conversation.updatedAt = payload.message.createdAt;
      const first = payload.message.parts[0];
      if (
        payload.message.role === 'user' &&
        conversation.title === 'Новый разговор' &&
        first?.type === 'text'
      ) {
        conversation.title =
          first.text.length > 60 ? `${first.text.slice(0, 57)}…` : first.text;
      }
    },
    streamStarted: (
      state,
      { payload }: PayloadAction<{ conversationId: string; messageId: string }>,
    ) => {
      state.streaming = payload;
    },
    streamEvent: (
      state,
      {
        payload,
      }: PayloadAction<{
        conversationId: string;
        messageId: string;
        event: ChatEventDto;
      }>,
    ) => {
      const message = state.conversations[
        payload.conversationId
      ]?.messages.find(m => m.id === payload.messageId);
      if (!message) return;
      const { event } = payload;
      switch (event.type) {
        case 'text-delta': {
          const last = message.parts.at(-1);
          if (last?.type === 'text') last.text += event.text;
          else message.parts.push({ type: 'text', text: event.text });
          break;
        }
        case 'tool-call':
          message.parts.push({
            type: 'tool',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            args: event.args,
            done: false,
          });
          break;
        case 'tool-result': {
          const index = message.parts.findIndex(
            p => p.type === 'tool' && p.toolCallId === event.toolCallId,
          );
          const part: ToolPart = {
            type: 'tool',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            args: index >= 0 ? (message.parts[index] as ToolPart).args : {},
            result: event.result,
            isError: event.isError,
            done: true,
          };
          if (index >= 0) message.parts[index] = part;
          else message.parts.push(part);
          break;
        }
        case 'error':
          message.error = event.message;
          break;
        case 'finish':
          break;
      }
    },
    streamFailed: (
      state,
      {
        payload,
      }: PayloadAction<{
        conversationId: string;
        messageId: string;
        error: string;
      }>,
    ) => {
      const message = state.conversations[
        payload.conversationId
      ]?.messages.find(m => m.id === payload.messageId);
      if (message) message.error = payload.error;
    },
    streamEnded: state => {
      if (state.streaming) {
        const conversation =
          state.conversations[state.streaming.conversationId];
        const message = conversation?.messages.find(
          m => m.id === state.streaming?.messageId,
        );
        for (const part of message?.parts ?? []) {
          if (part.type === 'tool' && !part.done) {
            Object.assign(part, { done: true, isError: true });
          }
        }
      }
      state.streaming = null;
    },
  },
});

export const {
  conversationStarted,
  conversationDeleted,
  messageAdded,
  streamStarted,
  streamEvent,
  streamFailed,
  streamEnded,
} = chatSlice.actions;

let abortController: AbortController | null = null;

export function stopStreaming(): void {
  abortController?.abort();
}

/** The Conversation so far as the API takes it: the text of each message. */
function toHistory(messages: readonly ChatMessage[]): ChatMessageDto[] {
  return messages
    .map(m => ({
      role: m.role,
      content: m.parts
        .filter(p => p.type === 'text')
        .map(p => p.text)
        .join('')
        .trim(),
    }))
    .filter(m => m.content.length > 0);
}

async function postChat(
  conversation: Conversation,
  token: string | null,
  signal: AbortSignal,
): Promise<Response> {
  return fetch(
    `${API_BASE}/workspaces/${conversation.workspaceId}/projects/${conversation.projectId}/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages: toHistory(conversation.messages) }),
      signal,
    },
  );
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { code?: string; message?: string };
    if (body.code === 'AGENT_NOT_CONFIGURED') {
      return 'Ассистент не настроен на сервере: задайте OPENROUTER_API_KEY в .env API и перезапустите его.';
    }
    return body.message ?? `Ошибка запроса (${response.status})`;
  } catch {
    return `Ошибка запроса (${response.status})`;
  }
}

/** Yields each `data:` event of a server-sent event stream. */
async function* readEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatEventDto> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const data = chunk
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice(5).trimStart())
        .join('\n');
      if (data) yield JSON.parse(data) as ChatEventDto;
    }
  }
}

export const sendMessage = createAsyncThunk<
  void,
  { conversationId: string; text: string },
  { state: RootState; dispatch: AppDispatch }
>('chat/sendMessage', async ({ conversationId, text }, api) => {
  const { dispatch, getState } = api;
  const now = () => new Date().toISOString();
  dispatch(
    messageAdded({
      conversationId,
      message: {
        id: nanoid(),
        role: 'user',
        parts: [{ type: 'text', text }],
        createdAt: now(),
      },
    }),
  );
  const conversation = getState().chat.conversations[conversationId];
  if (!conversation) return;

  const messageId = nanoid();
  dispatch(
    messageAdded({
      conversationId,
      message: {
        id: messageId,
        role: 'assistant',
        parts: [],
        createdAt: now(),
      },
    }),
  );
  dispatch(streamStarted({ conversationId, messageId }));

  abortController = new AbortController();
  const { signal } = abortController;
  try {
    let response = await postChat(
      conversation,
      getState().auth.accessToken,
      signal,
    );
    if (response.status === 401 && (await refreshTokens(getState, dispatch))) {
      response = await postChat(
        conversation,
        getState().auth.accessToken,
        signal,
      );
    }
    if (!response.ok || !response.body) {
      dispatch(
        streamFailed({
          conversationId,
          messageId,
          error: await readError(response),
        }),
      );
      return;
    }
    for await (const event of readEvents(response.body)) {
      dispatch(streamEvent({ conversationId, messageId, event }));
      if (
        event.type === 'tool-result' &&
        !event.isError &&
        WRITING_TOOL.test(event.toolName)
      ) {
        dispatch(baseApi.util.invalidateTags(['Knowledge']));
      }
    }
  } catch (error) {
    if (!signal.aborted) {
      dispatch(
        streamFailed({
          conversationId,
          messageId,
          error:
            error instanceof TypeError
              ? 'Нет связи с API Intentra. Он запущен на :3000?'
              : String(error),
        }),
      );
    }
  } finally {
    abortController = null;
    dispatch(streamEnded());
  }
});

export const selectConversations = (
  state: RootState,
  projectId: string,
): Conversation[] =>
  Object.values(state.chat.conversations)
    .filter(c => c.projectId === projectId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
