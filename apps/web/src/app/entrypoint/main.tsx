import '../styles/index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initI18n, syncDocumentLanguage } from '@/shared/i18n';

import { App } from './app';

initI18n();
syncDocumentLanguage();

const root = document.getElementById('root');
if (!root) {
  throw new Error('index.html has no #root');
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
