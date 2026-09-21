import { createListenerMiddleware } from '@reduxjs/toolkit';

import { languageSelected } from '@/features/language-switch';
import { i18n } from '@/shared/config/i18n';

/** Everything that touches the document or i18next lives here, so the reducer
 *  stays pure and no component has to remember to do it twice. */
export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: languageSelected,
  effect: async action => {
    await i18n.changeLanguage(action.payload);
    document.documentElement.lang = action.payload;
  },
});
