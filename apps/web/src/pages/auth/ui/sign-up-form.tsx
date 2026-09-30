import { zodResolver } from '@hookform/resolvers/zod';
import i18next from 'i18next';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useSignInMutation, useSignUpMutation } from '@/entities/session';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/shared/ui';
import { RegisterAccountDtoSchema } from '@intentra/contracts/iam';

/** The contract's fields, plus the password typed twice: there is no password reset yet. */
const SignUpFormSchema = RegisterAccountDtoSchema.extend({
  repeatPassword: z.string(),
}).refine(data => data.password === data.repeatPassword, {
  path: ['repeatPassword'],
  error: () => i18next.t('fields.passwordsDiffer'),
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

/** Codes that concern one field, shown under it. */
const FIELDS_BY_CODE = { ACCOUNT_ALREADY_EXISTS: 'email' } as const;

/** Creates the Account and signs in with it right away. */
export function SignUpForm() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [signUp] = useSignUpMutation();
  const [signIn] = useSignInMutation();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: '', password: '', repeatPassword: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async ({ email, password }) => {
    const error = toApiError((await signUp({ email, password })).error);
    if (error) {
      const { field, text } = describeError(error, FIELDS_BY_CODE);
      form.setError(field ?? 'root', { message: text });
      return;
    }
    const signedIn = await signIn({ email, password });
    if (signedIn.error) {
      form.setError('root', { message: t('signUp.signInFailed') });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor='email'>{t('fields.email')}</FieldLabel>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            aria-invalid={Boolean(errors.email)}
            {...form.register('email')}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor='password'>{t('fields.password')}</FieldLabel>
          <Input
            id='password'
            type='password'
            autoComplete='new-password'
            aria-invalid={Boolean(errors.password)}
            {...form.register('password')}
          />
          {errors.password ? (
            <FieldError errors={[errors.password]} />
          ) : (
            <FieldDescription>{t('fields.passwordHint')}</FieldDescription>
          )}
        </Field>
        <Field data-invalid={Boolean(errors.repeatPassword)}>
          <FieldLabel htmlFor='repeat-password'>
            {t('fields.repeatPassword')}
          </FieldLabel>
          <Input
            id='repeat-password'
            type='password'
            autoComplete='new-password'
            aria-invalid={Boolean(errors.repeatPassword)}
            {...form.register('repeatPassword')}
          />
          <FieldError errors={[errors.repeatPassword]} />
        </Field>
        {errors.root && (
          <Alert variant='destructive'>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}
        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {t('signUp.submit')}
        </Button>
      </FieldGroup>
    </form>
  );
}
