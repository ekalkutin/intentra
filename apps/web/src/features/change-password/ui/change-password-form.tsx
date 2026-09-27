import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/ui/button';
import { FieldError } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import {
  SettingsCard,
  SettingsCardFooter,
  SettingsRow,
} from '@/shared/ui/settings';
import { Spinner } from '@/shared/ui/spinner';
import {
  ACCOUNT_PASSWORD_MIN_LENGTH,
  ChangePasswordDtoSchema,
} from '@intentra/contracts/iam';

import { useChangePassword } from '../model/use-change-password';

const ChangePasswordFormSchema = ChangePasswordDtoSchema.extend({
  confirmPassword: z.string(),
}).refine(values => values.newPassword === values.confirmPassword, {
  path: ['confirmPassword'],
  error: 'Passwords do not match.',
});

type ChangePasswordFormValues = z.infer<typeof ChangePasswordFormSchema>;

const EMPTY_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const FIELDS: readonly {
  name: FieldPath<ChangePasswordFormValues>;
  label: string;
  description?: string;
  autoComplete: string;
}[] = [
  {
    name: 'currentPassword',
    label: 'Current password',
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    label: 'New password',
    description: `At least ${ACCOUNT_PASSWORD_MIN_LENGTH} characters.`,
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm new password',
    autoComplete: 'new-password',
  },
];

export const ChangePasswordForm = () => {
  const { changePassword, loading } = useChangePassword();
  const [changed, setChanged] = useState(false);
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const onSubmit = async ({
    currentPassword,
    newPassword,
  }: ChangePasswordFormValues) => {
    const failure = await changePassword({ currentPassword, newPassword });
    if (failure) {
      form.setError(failure.wrongPassword ? 'currentPassword' : 'root', {
        message: failure.message,
      });
      return;
    }
    form.reset(EMPTY_VALUES);
    setChanged(true);
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      onChange={() => setChanged(false)}
    >
      <SettingsCard>
        {FIELDS.map(item => (
          <Controller
            key={item.name}
            name={item.name}
            control={form.control}
            render={({ field, fieldState }) => (
              <SettingsRow
                label={item.label}
                description={item.description}
                size='text'
              >
                <Input
                  {...field}
                  type='password'
                  autoComplete={item.autoComplete}
                  aria-label={item.label}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError className='mt-1' errors={[fieldState.error]} />
                ) : null}
              </SettingsRow>
            )}
          />
        ))}
        <SettingsCardFooter>
          <p
            role='status'
            className='mr-auto flex items-center gap-1.5 text-caption'
          >
            {rootError ? (
              <span className='text-destructive'>{rootError}</span>
            ) : changed ? (
              <>
                <CheckIcon className='size-3.5 text-success' />
                <span className='text-muted-foreground'>Password changed</span>
              </>
            ) : null}
          </p>
          <Button type='submit' size='sm' disabled={loading}>
            {loading ? <Spinner data-icon='inline-start' /> : null}
            Change password
          </Button>
        </SettingsCardFooter>
      </SettingsCard>
    </form>
  );
};
