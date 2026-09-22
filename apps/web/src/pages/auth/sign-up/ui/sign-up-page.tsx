import { Link } from 'react-router';

import {
  AuthCredentialsForm,
  describeAuthError,
  useAuthSubmit,
  useSignUpMutation,
} from '@/features/auth';
import { useDict } from '@/features/language-switch';
import { AuthLayout } from '@/widgets/auth-layout';

export function SignUpPage() {
  const t = useDict();
  const [signUp, { isLoading, error }] = useSignUpMutation();
  const submit = useAuthSubmit(signUp);

  return (
    <AuthLayout
      title={t.auth.signUp.title}
      description={t.auth.signUp.description}
      footer={
        <>
          {t.auth.signUp.haveAccount}{' '}
          <Link
            to='/auth/sign-in'
            className='font-medium text-foreground underline underline-offset-4'
          >
            {t.auth.signUp.goToSignIn}
          </Link>
        </>
      }
    >
      <AuthCredentialsForm
        copy={{
          emailLabel: t.auth.emailLabel,
          emailPlaceholder: t.auth.emailPlaceholder,
          passwordLabel: t.auth.passwordLabel,
          passwordPlaceholder: t.auth.signUp.passwordPlaceholder,
          submit: t.auth.signUp.submit,
          submitting: t.auth.signUp.submitting,
        }}
        passwordAutoComplete='new-password'
        pending={isLoading}
        refusal={describeAuthError(error, t.auth.unreachable)}
        onSubmit={credentials => void submit(credentials)}
      />
    </AuthLayout>
  );
}
