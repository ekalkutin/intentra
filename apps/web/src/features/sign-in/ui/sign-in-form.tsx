import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';
import { SignInDtoSchema, type SignInDto } from '@intentra/contracts/iam';

import { useSignIn } from '../model/use-sign-in';

type SignInFormProps = {
  onSuccess: () => void;
};

export const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const { signIn, loading } = useSignIn();
  const form = useForm<SignInDto>({
    resolver: zodResolver(SignInDtoSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInDto) => {
    const error = await signIn(values);
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
              <FieldLabel htmlFor='sign-in-email'>Email</FieldLabel>
              <Input
                {...field}
                id='sign-in-email'
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
              <FieldLabel htmlFor='sign-in-password'>Password</FieldLabel>
              <Input
                {...field}
                id='sign-in-password'
                type='password'
                autoComplete='current-password'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type='submit' size='lg' className='w-full' disabled={loading}>
        {loading ? <Spinner /> : null}
        Sign in
      </Button>
    </form>
  );
};
