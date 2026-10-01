import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
} from '@/shared/ui';
import { SetProviderKeyDtoSchema } from '@intentra/contracts/workspace';

import { useSetProviderKeyMutation } from '../api/provider-key-api';
import { KEY_FIELD_CODES } from '../model/error-codes';

const formSchema = SetProviderKeyDtoSchema.extend({
  key: z.string().trim().min(1),
});

type FormValues = z.infer<typeof formSchema>;

/** Adds the Workspace's OpenRouter key or replaces the one there; OpenRouter checks it first. */
export function ProviderKeyForm({
  workspaceId,
  onDone,
  onCancel,
}: {
  readonly workspaceId: string;
  readonly onDone?: () => void;
  /** Shown while replacing a key, to keep the old one. */
  readonly onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const describeError = useDescribeError();
  const [setKey] = useSetProviderKeyMutation();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { key: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async ({ key }) => {
    const result = await setKey({ workspaceId, body: { key } });
    const error = toApiError(result.error);
    if (error) {
      const { field, text } = describeError(error, KEY_FIELD_CODES);
      form.setError(field ?? 'root', { message: text });
      return;
    }
    form.reset();
    onDone?.();
  });

  return (
    <form onSubmit={submit} noValidate className='flex max-w-lg flex-col gap-3'>
      <Field data-invalid={Boolean(errors.key)}>
        <FieldLabel htmlFor={`${id}-key`}>{t('providerKey.key')}</FieldLabel>
        <Input
          id={`${id}-key`}
          type='password'
          autoComplete='off'
          spellCheck={false}
          autoFocus={onCancel !== undefined}
          placeholder='sk-or-v1-…'
          className='font-mono'
          aria-invalid={Boolean(errors.key)}
          {...form.register('key')}
        />
        <FieldDescription>{t('providerKey.keyHint')}</FieldDescription>
        <FieldError errors={[errors.key]} />
      </Field>
      {errors.root && (
        <Alert variant='destructive'>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}
      <div className='flex flex-wrap gap-2'>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? t('providerKey.checking') : t('common.save')}
        </Button>
        {onCancel && (
          <Button type='button' variant='ghost' onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}
