import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';

import { zodErrorMap } from '@/shared/lib/zod';

import './styles/index.css';

import { App } from './app';

z.config({ customError: zodErrorMap });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
