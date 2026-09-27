import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';
import { SignUpDtoSchema, type SignUpDto } from '@intentra/contracts/iam';

import { useSignUp } from '../model/use-sign-up';

type SignUpFormProps = {
  onSuccess: () => void;
};

export const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const { signUp, loading } = useSignUp();
  const form = useForm<SignUpDto>({
    resolver: zodResolver(SignUpDtoSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignUpDto) => {
    const error = await signUp(values);
    if (error) {
      form.setError('root', { message: error });
      return;
    }
    onSuccess();
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className='flex flex-col gap-6'
    >
      {rootError ? (
        <Alert variant='destructive'>
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Controller
          name='email'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='sign-up-email'>Email</FieldLabel>
              <Input
                {...field}
                id='sign-up-email'
                type='email'
                autoComplete='email'
                placeholder='you@company.com'
                autoFocus
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='sign-up-password'>Password</FieldLabel>
              <Input
                {...field}
                id='sign-up-password'
                type='password'
                autoComplete='new-password'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>At least 8 characters.</FieldDescription>
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type='submit' size='lg' className='w-full' disabled={loading}>
        {loading ? <Spinner /> : null}
        Create account
      </Button>
    </form>
  );
};
