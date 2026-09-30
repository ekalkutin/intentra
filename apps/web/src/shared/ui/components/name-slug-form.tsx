import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useRef, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { suggestSlug } from '@/shared/lib';

import { Alert, AlertDescription } from '../primitives/alert';
import { Button } from '../primitives/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../primitives/field';
import { Input } from '../primitives/input';
import { Spinner } from '../primitives/spinner';

/** How long a suggested slug may be; the server has the final word. */
const SUGGESTED_SLUG_LENGTH = 15;

export type NameSlug = { name: string; slug: string };

/** What went wrong, and the field it concerns, or null for the whole form. */
export type NameSlugError = {
  readonly field: keyof NameSlug | null;
  readonly text: string;
};

/**
 * A name and the slug it will be reached by. The slug is suggested from the
 * name until the person edits it themselves.
 */
export function NameSlugForm({
  schema,
  namePlaceholder,
  submitLabel,
  footer,
  onSubmit,
}: {
  readonly schema: z.ZodType<NameSlug, NameSlug>;
  readonly namePlaceholder: string;
  readonly submitLabel: ReactNode;
  /** Shown beside the submit button, such as a cancel button. */
  readonly footer?: ReactNode;
  /** Resolves with the error to show, or null once done. */
  readonly onSubmit: (values: NameSlug) => Promise<NameSlugError | null>;
}) {
  const { t } = useTranslation();
  const id = useId();
  const slugEdited = useRef(false);
  const form = useForm<NameSlug>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '' },
  });
  const { errors, isSubmitting } = form.formState;
  const name = form.register('name', {
    onChange: event => {
      if (!slugEdited.current) {
        form.setValue(
          'slug',
          suggestSlug(String(event.target.value), SUGGESTED_SLUG_LENGTH),
        );
      }
    },
  });
  const slug = form.register('slug', {
    onChange: () => {
      slugEdited.current = true;
    },
  });

  const submit = form.handleSubmit(async values => {
    const error = await onSubmit(values);
    if (error) {
      form.setError(error.field ?? 'root', { message: error.text });
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor={`${id}-name`}>{t('fields.name')}</FieldLabel>
          <Input
            id={`${id}-name`}
            autoComplete='off'
            autoFocus
            placeholder={namePlaceholder}
            aria-invalid={Boolean(errors.name)}
            {...name}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.slug)}>
          <FieldLabel htmlFor={`${id}-slug`}>{t('fields.slug')}</FieldLabel>
          <Input
            id={`${id}-slug`}
            autoComplete='off'
            spellCheck={false}
            className='font-mono'
            aria-invalid={Boolean(errors.slug)}
            {...slug}
          />
          {errors.slug ? (
            <FieldError errors={[errors.slug]} />
          ) : (
            <FieldDescription>{t('fields.slugHint')}</FieldDescription>
          )}
        </Field>
        {errors.root && (
          <Alert variant='destructive'>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}
        <div className='flex flex-wrap items-center justify-end gap-2'>
          {footer}
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Spinner />}
            {submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
