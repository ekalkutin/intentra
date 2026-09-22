import { configureStore } from '@reduxjs/toolkit';

import { languageSlice } from '@/features/language-switch';
import { api } from '@/shared/api';

import { listenerMiddleware } from './listeners';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [languageSlice.reducerPath]: languageSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
