import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/api/base-api';
import { authSlice } from '@/features/auth/auth-slice';
import { CHAT_STORAGE_KEY, chatSlice } from '@/features/chat/chat-slice';
import { writeStored } from '@/lib/storage';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    chat: chatSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Conversations live in this browser only (the API keeps none yet).
let savedConversations = store.getState().chat.conversations;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
store.subscribe(() => {
  const { conversations } = store.getState().chat;
  if (conversations === savedConversations) return;
  savedConversations = conversations;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(
    () => writeStored(CHAT_STORAGE_KEY, savedConversations),
    400,
  );
});

// A signed-out user must not see the previous user's cached data.
let wasSignedIn = store.getState().auth.refreshToken !== null;
store.subscribe(() => {
  const signedIn = store.getState().auth.refreshToken !== null;
  if (wasSignedIn && !signedIn) {
    store.dispatch(baseApi.util.resetApiState());
  }
  wasSignedIn = signedIn;
});
