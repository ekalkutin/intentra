import { useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ME_QUERY } from '@/entities/account';
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
  UpdateAccountDtoSchema,
  type UpdateAccountDto,
} from '@intentra/contracts/iam';

import { useUpdateAccount } from '../model/use-update-account';

export const UpdateAccountForm = () => {
  const { data } = useQuery(ME_QUERY);
  const { updateAccount, loading } = useUpdateAccount();
  const form = useForm<UpdateAccountDto>({
    resolver: zodResolver(UpdateAccountDtoSchema),
    defaultValues: { displayName: '' },
  });
  const { reset } = form;
  const savedName = data?.me.displayName ?? '';

  useEffect(() => {
    reset({ displayName: savedName });
  }, [reset, savedName]);

  const onSubmit = async (values: UpdateAccountDto) => {
    const error = await updateAccount(values);
    if (error) form.setError('root', { message: error });
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <SettingsCard>
        <SettingsRow
          label='Email'
          description='You sign in with it. It cannot be changed yet.'
          size='text'
        >
          <Input value={data?.me.email ?? ''} readOnly disabled />
        </SettingsRow>
        <Controller
          name='displayName'
          control={form.control}
          render={({ field, fieldState }) => (
            <SettingsRow
              label='Display name'
              description='How other members see you. Leave empty to show your email.'
              size='text'
            >
              <Input
                {...field}
                value={field.value ?? ''}
                autoComplete='name'
                placeholder='Ann Lee'
                aria-label='Display name'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError className='mt-1' errors={[fieldState.error]} />
              ) : null}
            </SettingsRow>
          )}
        />
        <SettingsCardFooter>
          {rootError ? (
            <p role='alert' className='mr-auto text-caption text-destructive'>
              {rootError}
            </p>
          ) : null}
          <Button
            type='submit'
            size='sm'
            disabled={!form.formState.isDirty || loading}
          >
            {loading ? <Spinner data-icon='inline-start' /> : null}
            Save
          </Button>
        </SettingsCardFooter>
      </SettingsCard>
    </form>
  );
};
