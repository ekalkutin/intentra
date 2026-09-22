import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from './base-query';

/**
 * Пустое основание: сами эндпойнты внедряют слои выше через
 * `injectEndpoints`, каждый в своём срезе. Так `shared` не знает ни про вход,
 * ни про workspace — знает только, как сходить на сервер.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Session', 'Workspace', 'Project'],
  endpoints: () => ({}),
});
