import { Link } from 'react-router';

import {
  AuthCredentialsForm,
  describeAuthError,
  useAuthSubmit,
  useSignInMutation,
} from '@/features/auth';
import { useDict } from '@/features/language-switch';
import { AuthLayout } from '@/widgets/auth-layout';

export function SignInPage() {
  const t = useDict();
  const [signIn, { isLoading, error }] = useSignInMutation();
  const submit = useAuthSubmit(signIn);

  return (
    <AuthLayout
      title={t.auth.signIn.title}
      description={t.auth.signIn.description}
      footer={
        <>
          {t.auth.signIn.noAccount}{' '}
          <Link
            to='/auth/sign-up'
            className='font-medium text-foreground underline underline-offset-4'
          >
            {t.auth.signIn.goToSignUp}
          </Link>
        </>
      }
    >
      <AuthCredentialsForm
        copy={{
          emailLabel: t.auth.emailLabel,
          emailPlaceholder: t.auth.emailPlaceholder,
          passwordLabel: t.auth.passwordLabel,
          passwordPlaceholder: t.auth.passwordPlaceholder,
          submit: t.auth.signIn.submit,
          submitting: t.auth.signIn.submitting,
        }}
        passwordAutoComplete='current-password'
        pending={isLoading}
        refusal={describeAuthError(error, t.auth.unreachable)}
        onSubmit={credentials => void submit(credentials)}
      />
    </AuthLayout>
  );
}
