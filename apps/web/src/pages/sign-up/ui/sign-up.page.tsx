import { Link, useNavigate } from 'react-router';

import { SignUpForm } from '@/features/sign-up';
import { ROUTES } from '@/shared/config';

export const SignUpPage = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-title-lg font-semibold text-balance text-foreground'>
          Create your Intentra account
        </h1>
        <p className='text-body text-pretty text-muted-foreground'>
          Sign up with your email and a password.
        </p>
      </div>
      <SignUpForm onSuccess={() => navigate(ROUTES.HOME, { replace: true })} />
      <p className='text-center text-body text-muted-foreground'>
        Already have an account?{' '}
        <Link
          to={ROUTES.AUTH.SIGN_IN}
          className='font-medium text-foreground underline-offset-4 hover:underline'
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
