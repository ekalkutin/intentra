import { useNavigate } from 'react-router';

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
    </div>
  );
};
