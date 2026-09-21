import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { i18n, resolveLanguage, type Language } from '@/shared/config/i18n';

export interface LanguageState {
  current: Language;
}

/* i18next has already run its detector by the time the store is created, so
 * its resolved language is the honest starting point — not a hardcoded default
 * that would flash the wrong copy on first paint. */
const initialState: LanguageState = {
  current: resolveLanguage(i18n.resolvedLanguage),
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    languageSelected(state, action: PayloadAction<Language>) {
      state.current = action.payload;
    },
  },
  selectors: {
    selectLanguage: state => state.current,
  },
});

export const { languageSelected } = languageSlice.actions;
export const { selectLanguage } = languageSlice.selectors;
