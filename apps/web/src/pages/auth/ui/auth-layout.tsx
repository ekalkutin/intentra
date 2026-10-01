import type { ReactNode } from 'react';

import { LanguageSwitch } from '@/features/switch-language';
import { ThemeSwitch } from '@/features/switch-theme';
import { PageHeader } from '@/shared/ui';

import { AuthMosaic } from './auth-mosaic';

/**
 * The shared frame for sign-in and sign-up, drawn like the app shell: a
 * rounded canvas on the frame grey, the artwork on the left and the form on
 * the right. From 2xl the canvas stops growing and sits in the centre. Below
 * lg the artwork is a banner above the form. Text is not selectable, so a
 * stray drag does not highlight it; the fields still are.
 */
export function AuthLayout(props: {
  readonly title: string;
  readonly description: string;
  readonly footer: ReactNode;
  readonly children: ReactNode;
  /** Increment to start a new glitch without resetting the mosaic. */
  readonly glitchTrigger?: number;
}) {
  return (
    <div className='flex min-h-svh bg-sidebar select-none lg:items-center [&_input]:select-text lg:justify-center lg:p-2'>
      <div className='grid w-full grid-rows-[auto_1fr] bg-background lg:min-h-[calc(100svh-1rem)] lg:grid-cols-2 lg:grid-rows-1 lg:overflow-hidden lg:rounded-xl lg:ring-1 lg:ring-border dark:ring-0 2xl:min-h-[min(calc(100svh-1rem),54rem)] 2xl:max-w-[88rem]'>
        <AuthMosaic glitchTrigger={props.glitchTrigger} />
        <div className='flex min-w-0 flex-col'>
          <header className='hidden h-22 shrink-0 items-center justify-end gap-1 px-6 lg:flex'>
            <LanguageSwitch />
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
    </div>
  );
}
