import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { readStored, writeStored } from '@/lib/storage';
import type { TokenPair } from '@intentra/contracts/iam';

const STORAGE_KEY = 'intentra.auth';

export type AuthState = {
  readonly accessToken: string | null;
  readonly refreshToken: string | null;
};

const empty: AuthState = { accessToken: null, refreshToken: null };

export const authSlice = createSlice({
  name: 'auth',
  initialState: (): AuthState => readStored(STORAGE_KEY, empty),
  reducers: {
    tokensReceived: (_state, { payload }: PayloadAction<TokenPair>) => {
      const next = {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
      };
      writeStored(STORAGE_KEY, next);
      return next;
    },
    signedOut: () => {
      writeStored(STORAGE_KEY, empty);
      return empty;
    },
  },
  selectors: {
    selectAccessToken: state => state.accessToken,
    selectRefreshToken: state => state.refreshToken,
    selectIsSignedIn: state => state.refreshToken !== null,
  },
});

export const { tokensReceived, signedOut } = authSlice.actions;
export const { selectAccessToken, selectRefreshToken, selectIsSignedIn } =
  authSlice.selectors;
