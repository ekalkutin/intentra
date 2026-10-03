import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router/dom';

import { ThemeProvider } from '@/shared/lib';

import { store } from '../model';
import { router } from '../routes';

import { StartupReady } from './startup-ready';

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <StartupReady />
      </ThemeProvider>
    </Provider>
  );
}
