import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';

import { useCurrentWorkspace } from '@/entities/workspace';
import { Button } from '@/shared/ui/button';
import { FieldError } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import {
  SettingsCard,
  SettingsCardFooter,
  SettingsRow,
} from '@/shared/ui/settings';
import { Skeleton } from '@/shared/ui/skeleton';
import { Spinner } from '@/shared/ui/spinner';
import {
  SetOpenRouterKeyDtoSchema,
  type SetOpenRouterKeyDto,
} from '@intentra/contracts/agents';

import { useOpenRouterKey } from '../model/use-open-router-key';

const DATE_FORMAT = 'MMM d, yyyy';

export const OpenRouterKeyForm = () => {
  const workspace = useCurrentWorkspace();
  const { key, loading, setKey, removeKey, saving, removing } =
    useOpenRouterKey(workspace.id);
  const form = useForm<SetOpenRouterKeyDto>({
    resolver: zodResolver(SetOpenRouterKeyDtoSchema),
    defaultValues: { apiKey: '' },
  });

  const onSubmit = async (values: SetOpenRouterKeyDto) => {
    const error = await setKey(values);
    if (error) {
      form.setError('root', { message: error });
      return;
    }
    form.reset({ apiKey: '' });
  };

  const onRemove = async () => {
    const error = await removeKey();
    if (error) form.setError('root', { message: error });
  };

  const rootError = form.formState.errors.root?.message;

  if (loading) {
    return <Skeleton className='h-32 w-full rounded-xl' />;
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <SettingsCard>
        <Controller
          name='apiKey'
          control={form.control}
          render={({ field, fieldState }) => (
            <SettingsRow
              label='API key'
              description={
                key
                  ? `Ends with …${key.hint}, set on ${format(new Date(key.updatedAt), DATE_FORMAT)}. Enter a new one to replace it.`
                  : 'Every agent of this workspace runs on it. Stored encrypted and never shown again.'
              }
              size='text'
            >
              <Input
                {...field}
                type='password'
                autoComplete='off'
                placeholder={key ? `…${key.hint}` : 'sk-or-v1-…'}
                aria-label='OpenRouter API key'
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
          {key ? (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={removing}
              onClick={onRemove}
            >
              {removing ? <Spinner data-icon='inline-start' /> : null}
              Remove
            </Button>
          ) : null}
          <Button
            type='submit'
            size='sm'
            disabled={!form.formState.isDirty || saving}
          >
            {saving ? <Spinner data-icon='inline-start' /> : null}
            {key ? 'Replace' : 'Save'}
          </Button>
        </SettingsCardFooter>
      </SettingsCard>
    </form>
  );
};
