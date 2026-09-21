import { configureStore } from '@reduxjs/toolkit';

import { languageSlice } from '@/features/language-switch';

import { listenerMiddleware } from './listeners';

export const store = configureStore({
  reducer: {
    [languageSlice.reducerPath]: languageSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
