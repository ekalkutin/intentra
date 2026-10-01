import type { ReactNode } from 'react';

import { ThemeSwitch } from '@/features/switch-theme';
import { PageHeader } from '@/shared/ui';

import { AuthMosaic } from './auth-mosaic';

/** The shared two-column frame for sign-in and sign-up. */
export function AuthLayout(props: {
  readonly title: string;
  readonly description: string;
  readonly footer: ReactNode;
  readonly children: ReactNode;
  /** Increment to start a new glitch without resetting the mosaic. */
  readonly glitchTrigger?: number;
}) {
  return (
    <div className='grid min-h-svh grid-rows-[auto_1fr] bg-background lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:grid-rows-1 lg:p-2'>
      <AuthMosaic glitchTrigger={props.glitchTrigger} />
      <div className='flex min-w-0 flex-col'>
        <header className='hidden h-14 shrink-0 items-center justify-end px-6 lg:flex'>
          <ThemeSwitch />
        </header>
        <main className='flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-12 lg:py-16'>
          <div className='w-full max-w-sm animate-[page-settle_220ms_var(--ease-out-expo)_both]'>
            <PageHeader title={props.title} description={props.description} />
            <div className='mt-8'>{props.children}</div>
            <div className='mt-7 text-center text-sm text-muted-foreground'>
              {props.footer}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
