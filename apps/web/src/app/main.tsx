import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';

import { applyTheme } from '@/shared/lib/theme';
import { zodErrorMap } from '@/shared/lib/zod';

import './styles/index.css';

import { App } from './app';

z.config({ customError: zodErrorMap });
applyTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
