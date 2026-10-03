import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useEditMeMutation } from '@/entities/session';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/shared/ui';
import { EditMeDtoSchema, type EditMeDto } from '@intentra/contracts/iam';

const FIELDS_BY_CODE = {
  INVALID_PERSON_NAME: 'name',
} as const satisfies Record<string, keyof EditMeDto>;

/** The person's name, as the others see it; saved on its own. */
export function NameForm({
  name,
  email,
}: {
  readonly name: string;
  readonly email: string;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [editMe] = useEditMeMutation();
  const form = useForm<EditMeDto>({
    resolver: zodResolver(EditMeDtoSchema),
    defaultValues: { name },
  });
  const { errors, isDirty, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async body => {
    const result = await editMe(body);
    const error = toApiError(result.error);
    if (error) {
      const { text } = describeError(error, FIELDS_BY_CODE);
      form.setError('name', { message: text });
      return;
    }
    form.reset({ name: result.data?.name ?? body.name });
  });

  return (
    <form onSubmit={submit} noValidate className='max-w-lg'>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor='account-name'>
            {t('fields.personName')}
          </FieldLabel>
          <div className='flex gap-2'>
            <Input
              id='account-name'
              autoComplete='name'
              aria-invalid={Boolean(errors.name)}
              {...form.register('name')}
            />
            <Button
              variant='outline'
              type='submit'
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting && <Spinner />}
              {t('common.save')}
            </Button>
          </div>
          <FieldDescription
            aria-label={t('fields.email')}
            className='break-all'
          >
            {email}
          </FieldDescription>
          <FieldError errors={[errors.name]} />
        </Field>
      </FieldGroup>
    </form>
  );
}
