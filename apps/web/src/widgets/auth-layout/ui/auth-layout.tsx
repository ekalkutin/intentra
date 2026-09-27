import { Target } from 'lucide-react';
import { Outlet } from 'react-router';

import { DotSphere } from '@/shared/ui/dot-sphere';

export const AuthLayout = () => (
  <div className='flex h-svh min-h-0 bg-background'>
    <aside className='hidden w-[19rem] shrink-0 p-3 md:block lg:w-[22rem] lg:p-4'>
      <div className='dark relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl bg-background px-5 pb-5 text-foreground ring-1 ring-border'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 bg-background'
        >
          <DotSphere
            dotGap={19}
            motion='wave'
            sphereCount={5}
            sphereRadius='20%'
            dotRadiusMax={1.9}
            speed={0.4}
          />
        </div>

        <div className='relative flex min-h-0 flex-1 flex-col pt-5'>
          <header className='flex min-h-9 items-center gap-2'>
            <Target aria-hidden className='size-5 shrink-0' />
            <span className='text-label font-medium'>Intentra</span>
          </header>

          <div className='flex flex-1 items-end pb-4'>
            <p className='text-body-lg text-balance text-muted-foreground'>
              Turn intent into work your team and agents can ship.
            </p>
          </div>
        </div>
      </div>
    </aside>

    <main className='min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-14 lg:py-10'>
      <div className='mx-auto flex min-h-full w-full max-w-[28rem] flex-col justify-center'>
        <Outlet />
      </div>
    </main>
  </div>
);
