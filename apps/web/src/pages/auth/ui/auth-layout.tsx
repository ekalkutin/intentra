import type { ReactNode } from 'react';

import { ThemeSwitch } from '@/features/switch-theme';
import { Brand, PageHeader } from '@/shared/ui';

/**
 * The frame of the sign-in and sign-up pages: the app's grey frame with one
 * canvas in the middle, the same material the signed-in shell is made of.
 */
export function AuthLayout(props: {
  readonly title: string;
  readonly description: string;
  readonly footer: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className='flex min-h-svh flex-col bg-sidebar'>
      <header className='flex h-12 shrink-0 items-center justify-between px-4'>
        <Brand />
        <ThemeSwitch />
      </header>
      <main className='flex flex-1 items-start justify-center px-4 pt-[12vh] pb-16'>
        <div className='w-full max-w-sm animate-[page-settle_220ms_var(--ease-out-expo)_both] rounded-xl bg-background shadow-(--canvas-shadow) ring-1 ring-border'>
          <div className='flex flex-col gap-6 p-6'>
            <PageHeader title={props.title} description={props.description} />
            {props.children}
          </div>
          <div className='border-t border-border px-6 py-4 text-center text-sm text-muted-foreground'>
            {props.footer}
          </div>
        </div>
      </main>
    </div>
  );
}
