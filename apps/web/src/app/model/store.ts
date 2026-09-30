import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/shared/api';

/** RTK Query's cache; the session itself lives in `sessionTokens`. */
export const store = configureStore({
  reducer: { [baseApi.reducerPath]: baseApi.reducer },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
