import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/ui/primitives/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/primitives/field';
import { Input } from '@/shared/ui/primitives/input';
import { SignInSchema, type SignInDto } from '@intentra/iam-contracts';

export type AuthCredentialsCopy = {
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submit: string;
  submitting: string;
};

type Props = {
  copy: AuthCredentialsCopy;
  /** `current-password` на входе, `new-password` при регистрации: браузер предлагает разное. */
  passwordAutoComplete: 'current-password' | 'new-password';
  pending: boolean;
  /** Отказ сервера — одной фразой, уже переведённой в текст для человека. */
  refusal: string | null;
  onSubmit: (credentials: SignInDto) => void;
};

/**
 * Форма «почта и пароль», общая для входа и регистрации.
 *
 * Проверяется схемой из контрактов — той же, которой запрос проверит сервер.
 * Поэтому короткий пароль человек видит сразу и видит ровно ту же фразу;
 * переписать правило здесь, чтобы приложить свой текст, значит однажды
 * разойтись с сервером.
 *
 * `standardSchemaResolver`, а не `zodResolver`: zod 4 реализует Standard
 * Schema, и через него resolver не привязан к конкретной библиотеке проверки.
 */
export function AuthCredentialsForm({
  copy,
  passwordAutoComplete,
  pending,
  refusal,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInDto>({
    resolver: standardSchemaResolver(SignInSchema),
    /* Проверка на уходе из поля, а не на каждом нажатии: «слишком короткий»
       под пальцами, пока пароль ещё набирается, — шум, а не помощь. */
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor='email'>{copy.emailLabel}</FieldLabel>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            inputMode='email'
            placeholder={copy.emailPlaceholder}
            aria-invalid={errors.email ? true : undefined}
            {...register('email')}
          />
          {errors.email ? (
            <FieldError>{errors.email.message}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={errors.password ? true : undefined}>
          <FieldLabel htmlFor='password'>{copy.passwordLabel}</FieldLabel>
          <Input
            id='password'
            type='password'
            autoComplete={passwordAutoComplete}
            placeholder={copy.passwordPlaceholder}
            aria-invalid={errors.password ? true : undefined}
            {...register('password')}
          />
          {errors.password ? (
            <FieldError>{errors.password.message}</FieldError>
          ) : null}
        </Field>

        {/* Отказ сервера стоит над кнопкой, а не всплывает уведомлением: на
            странице входа человек смотрит на форму, и ответ должен быть там,
            где он смотрит. */}
        {refusal ? (
          <p role='alert' className='text-sm leading-6 text-destructive'>
            {refusal}
          </p>
        ) : null}

        <Button
          type='submit'
          size='lg'
          className='w-full'
          disabled={pending}
          aria-busy={pending || undefined}
        >
          {pending ? (
            <>
              <Loader2 className='animate-spin' aria-hidden='true' />
              {copy.submitting}
            </>
          ) : (
            <>
              {copy.submit}
              <ArrowRight data-icon='inline-end' />
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
