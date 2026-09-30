import { useTranslation } from 'react-i18next';

import { useMeQuery } from '@/entities/session';
import { ThemeSwitch } from '@/features/switch-theme';
import { Brand, Spinner } from '@/shared/ui';

import { SignOutButton } from './sign-out-button';

/** Empty for now: who is signed in, and the way out. */
export function HomePage() {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();

  return (
    <div className='flex min-h-svh flex-col'>
      <header className='flex items-center justify-between border-b px-4 py-3'>
        <Brand />
        <div className='flex items-center gap-2'>
          <ThemeSwitch />
          <SignOutButton />
        </div>
      </header>
      <main className='flex flex-1 items-center justify-center p-4 text-muted-foreground'>
        {me ? t('home.signedInAs', { email: me.email }) : <Spinner />}
      </main>
    </div>
  );
}
