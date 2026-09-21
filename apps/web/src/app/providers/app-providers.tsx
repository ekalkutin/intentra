import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from '@/app/store';
import { i18n } from '@/shared/config/i18n';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ReduxProvider>
  );
}
