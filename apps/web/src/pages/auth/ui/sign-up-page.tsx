import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import { ROUTES } from '@/shared/config';

import { AuthLayout } from './auth-layout';
import { SignUpForm } from './sign-up-form';

export function SignUpPage() {
  const { t } = useTranslation();
  // Keeps `returnTo` when switching to the other page.
  const { search } = useLocation();

  return (
    <AuthLayout
      title={t('signUp.title')}
      description={t('signUp.description')}
      footer={
        <p>
          {t('signUp.haveAccount')}{' '}
          <Link
            to={{ pathname: ROUTES.signIn, search }}
            className='text-foreground underline'
          >
            {t('signUp.toSignIn')}
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
