import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import { ROUTES } from '@/shared/config';

import { AuthLayout } from './auth-layout';
import { SignInForm } from './sign-in-form';

export function SignInPage() {
  const { t } = useTranslation();
  // Keeps `returnTo` when switching to the other page.
  const { search } = useLocation();

  return (
    <AuthLayout
      title={t('signIn.title')}
      description={t('signIn.description')}
      footer={
        <p>
          {t('signIn.noAccount')}{' '}
          <Link
            to={{ pathname: ROUTES.signUp, search }}
            className='text-foreground underline'
          >
            {t('signIn.toSignUp')}
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthLayout>
  );
}
