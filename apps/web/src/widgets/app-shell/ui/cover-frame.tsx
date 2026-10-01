import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ROUTES } from '@/shared/config';
import { Brand } from '@/shared/ui';

import { HeaderControls } from './header-controls';

/** A page outside any Workspace (the first steps, received invitations). */
export function CoverFrame({ children }: { readonly children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className='flex min-h-svh flex-col'>
      <header className='flex h-14 shrink-0 items-center justify-between px-4 md:px-6'>
        <Link
          to={ROUTES.home}
          aria-label={t('brand')}
          className='rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
        >
          <Brand className='w-24' />
        </Link>
        <HeaderControls />
      </header>
      <main className='flex-1'>{children}</main>
    </div>
  );
}
