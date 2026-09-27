import { Link, useNavigate } from 'react-router';

import { SignInForm } from '@/features/sign-in';
import { ROUTES } from '@/shared/config';

export const SignInPage = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-title-lg font-semibold text-balance text-foreground'>
          Sign in to Intentra
        </h1>
        <p className='text-body text-pretty text-muted-foreground'>
          Enter your email and password to continue.
        </p>
      </div>
      <SignInForm onSuccess={() => navigate(ROUTES.HOME, { replace: true })} />
      <p className='text-center text-body text-muted-foreground'>
        No account yet?{' '}
        <Link
          to={ROUTES.AUTH.SIGN_UP}
          className='font-medium text-foreground underline-offset-4 hover:underline'
        >
          Create one
        </Link>
      </p>
    </div>
  );
};
