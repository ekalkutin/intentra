import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useSignInMutation } from '@/entities/session';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/shared/ui';
import { SignInDtoSchema, type SignInDto } from '@intentra/contracts/iam';

/**
 * Email and password; once signed in, the app leaves the sign-in page by
 * itself, to where the person was going.
 */
export function SignInForm() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [signIn] = useSignInMutation();
  const form = useForm<SignInDto>({
    resolver: zodResolver(SignInDtoSchema),
    defaultValues: { email: '', password: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async data => {
    const result = await signIn(data);
    const error = toApiError(result.error);
    if (error) {
      const { text } = describeError(error);
      form.setError('root', { message: text });
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
            autoComplete='current-password'
            aria-invalid={Boolean(errors.password)}
            {...form.register('password')}
          />
          <FieldError errors={[errors.password]} />
        </Field>
        {errors.root && (
          <Alert variant='destructive'>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}
        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {t('signIn.submit')}
        </Button>
      </FieldGroup>
    </form>
  );
}
