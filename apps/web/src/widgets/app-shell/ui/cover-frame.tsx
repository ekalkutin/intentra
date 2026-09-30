import type { ReactNode } from 'react';

import { Brand } from '@/shared/ui';

import { AccountMenu } from './account-menu';

/** A page outside any Workspace (the first steps, received invitations). */
export function CoverFrame({ children }: { readonly children: ReactNode }) {
  return (
    <div className='flex min-h-svh flex-col'>
      <header className='flex h-12 shrink-0 items-center justify-between border-b border-border px-4'>
        <Brand />
        <AccountMenu />
      </header>
      <main className='flex-1'>{children}</main>
    </div>
  );
}
