import { Link } from 'react-router';

import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/button';

export const NotFoundPage = () => (
  <main className='flex min-h-svh flex-col items-center justify-center gap-4'>
    <h1 className='font-heading text-2xl font-semibold'>Page not found</h1>
    <Button render={<Link to={ROUTES.HOME} />} nativeButton={false}>
      Go home
    </Button>
  </main>
);
