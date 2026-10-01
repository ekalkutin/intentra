import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useMemo, useRef } from 'react';
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import {
  FIELD_CONTROLS,
  kindFields,
  KNOWLEDGE_ERROR_CODES,
  useEditKnowledgeItemMutation,
  useFieldTexts,
  useRecordKnowledgeItemMutation,
  type InProject,
  type KindField,
} from '@/entities/knowledge-item';
import { toApiError } from '@/shared/api';
import { knowledgeItemPath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  PageSection,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Textarea,
  UnsavedChangesGuard,
} from '@/shared/ui';
import {
  EditKnowledgeItemDtoSchema,
  RecordKnowledgeItemDtoSchema,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import {
  editorSchema,
  toFieldsDto,
  type AlternativeValue,
  type EditorValues,
} from '../model/editor-values';

import { AlternativesInput } from './alternatives-input';
import { LinksInput, type LinkTarget } from './links-input';
import { ListInput } from './list-input';

/** What the form saves: a new Draft (perhaps replacing an item), or a change to one. */
export type EditorTarget =
  | { readonly mode: 'record'; readonly supersedes: string | null }
  | { readonly mode: 'edit'; readonly key: string; readonly version: number };

const FIELDS_BY_CODE = {
  INVALID_KNOWLEDGE_TITLE: 'title',
  INVALID_RATIONALE: 'rationale',
  RATIONALE_REQUIRED: 'rationale',
} as const satisfies Record<string, keyof EditorValues>;

/**
 * A Draft's title, rationale, fields and Links. Leaving with unsaved changes
 * asks first; saving opens the item.
 */
export function EditorForm({
  kind,
  target,
  initial,
  scope,
  slugs,
  linkTargets,
  cancelTo,
  submitLabel,
}: {
  readonly kind: KnowledgeKindDto;
  readonly target: EditorTarget;
  readonly initial: EditorValues;
  readonly scope: InProject;
  readonly slugs: {
    readonly workspaceSlug: string;
    readonly projectSlug: string;
  };
  readonly linkTargets: readonly LinkTarget[];
  readonly cancelTo: string;
  readonly submitLabel: string;
}) {
  const { t } = useTranslation();
  const id = useId();
  const navigate = useNavigate();
  const describeError = useDescribeError();
  const texts = useFieldTexts();
  const saved = useRef(false);
  const [record] = useRecordKnowledgeItemMutation();
  const [edit] = useEditKnowledgeItemMutation();
  const schema = useMemo(() => editorSchema(kind), [kind]);
  const form = useForm<EditorValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });
  const { errors, isSubmitting, isDirty } = form.formState;
  /** Sends the form as the API takes it; null when it does not fit the contract. */
  const save = async (frame: Record<string, unknown>) => {
    if (target.mode === 'record') {
      const body = RecordKnowledgeItemDtoSchema.safeParse({
        ...frame,
        supersedes: target.supersedes,
      });
      return body.success ? record({ ...scope, body: body.data }) : null;
    }
    const body = EditKnowledgeItemDtoSchema.safeParse({
      ...frame,
      version: target.version,
    });
    return body.success
      ? edit({ ...scope, key: target.key, body: body.data })
      : null;
  };

  const submit = form.handleSubmit(async values => {
    const frame = {
      kind,
      title: values.title.trim(),
      rationale: values.rationale.trim() || null,
      fields: toFieldsDto(kind, values.fields),
      links: values.links,
    };
    const result = await save(frame);
    if (!result) {
      form.setError('root', { message: t('errors.VALIDATION_FAILED') });
      return;
    }
    const error = toApiError(result.error);
    if (error) {
      if (error.code === KNOWLEDGE_ERROR_CODES.changed) {
        form.setError('root', { message: t('knowledgeEditor.changed') });
        return;
      }
      const { field, text } = describeError(error, FIELDS_BY_CODE);
      form.setError(field ?? 'root', { message: text });
      return;
    }
    saved.current = true;
    const key = result.data?.key ?? (target.mode === 'edit' ? target.key : '');
    void navigate(
      knowledgeItemPath(slugs.workspaceSlug, slugs.projectSlug, key),
      { replace: true },
    );
  });

  const described = kindFields(kind).fields;
  const main = kindFields(kind).main;
  const invalidLinkRows = new Set(
    form
      .watch('links')
      .map((_, index) => (errors.links?.[index] ? index : null))
      .filter(index => index !== null),
  );

  return (
    <form
      onSubmit={submit}
      noValidate
      className='flex max-w-2xl flex-col gap-8'
    >
      <PageSection title={t('knowledgeEditor.about')}>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.title)}>
            <FieldLabel htmlFor={`${id}-title`}>
              {t('knowledgeEditor.title')}
              <span aria-hidden className='text-muted-foreground'>
                *
              </span>
            </FieldLabel>
            <Input
              id={`${id}-title`}
              autoComplete='off'
              autoFocus
              maxLength={200}
              aria-invalid={Boolean(errors.title)}
              {...form.register('title')}
            />
            <FieldDescription>
              {t('knowledgeEditor.titleHint')}
            </FieldDescription>
            <FieldError errors={[errors.title]} />
          </Field>
        </FieldGroup>
      </PageSection>
      <PageSection title={t('knowledgeEditor.content')}>
        <FieldGroup>
          {described.map(field => (
            <KindFieldInput
              key={field.name}
              id={`${id}-${field.name}`}
              field={field}
              required={field.name === main}
              control={form.control}
              errors={errors}
              label={texts.label(kind, field.name)}
              hint={texts.hint(kind, field.name)}
              option={value => texts.option(kind, field.name, value)}
            />
          ))}
          <Field data-invalid={Boolean(errors.rationale)}>
            <FieldLabel htmlFor={`${id}-rationale`}>
              {t('knowledgeEditor.rationale')}
            </FieldLabel>
            <Textarea
              id={`${id}-rationale`}
              rows={3}
              aria-invalid={Boolean(errors.rationale)}
              {...form.register('rationale')}
            />
            <FieldDescription>
              {t('knowledgeEditor.rationaleHint')}
            </FieldDescription>
            <FieldError errors={[errors.rationale]} />
          </Field>
        </FieldGroup>
      </PageSection>
      <PageSection
        title={t('knowledgeEditor.links')}
        description={t('knowledgeEditor.linksHint')}
      >
        <Controller
          control={form.control}
          name='links'
          render={({ field }) => (
            <Field data-invalid={invalidLinkRows.size > 0}>
              <LinksInput
                id={`${id}-links`}
                value={field.value}
                onChange={field.onChange}
                targets={linkTargets}
                invalidRows={invalidLinkRows}
              />
              {invalidLinkRows.size > 0 && (
                <FieldError>{t('validation.required')}</FieldError>
              )}
            </Field>
          )}
        />
      </PageSection>
      {errors.root && (
        <Alert variant='destructive'>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}
      <div className='sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background py-3'>
        <Button
          variant='ghost'
          render={<Link to={cancelTo} />}
          nativeButton={false}
        >
          {t('common.cancel')}
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {submitLabel}
        </Button>
      </div>
      <UnsavedChangesGuard when={isDirty} saved={saved} />
    </form>
  );
}

/** One of the Kind's fields, entered the way its description says. */
function KindFieldInput({
  id,
  field,
  required,
  control,
  errors,
  label,
  hint,
  option,
}: {
  readonly id: string;
  readonly field: KindField;
  readonly required: boolean;
  readonly control: Control<EditorValues>;
  readonly errors: FieldErrors<EditorValues>;
  readonly label: string;
  readonly hint: string | null;
  readonly option: (value: string) => string;
}) {
  const { t } = useTranslation();
  const error = errors.fields?.[field.name];
  const invalid = Boolean(error);
  const message = error && 'message' in error ? error : undefined;

  return (
    <Controller
      control={control}
      name={`fields.${field.name}` as `fields.${string}`}
      render={({ field: input }) => (
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor={id}>
            {label}
            {required && (
              <span aria-hidden className='text-muted-foreground'>
                *
              </span>
            )}
          </FieldLabel>
          {field.control === FIELD_CONTROLS.text && (
            <Input
              id={id}
              autoComplete='off'
              aria-invalid={invalid}
              value={input.value as string}
              onChange={input.onChange}
              onBlur={input.onBlur}
            />
          )}
          {field.control === FIELD_CONTROLS.longText && (
            <Textarea
              id={id}
              rows={required ? 3 : 2}
              aria-invalid={invalid}
              value={input.value as string}
              onChange={input.onChange}
              onBlur={input.onBlur}
            />
          )}
          {field.control === FIELD_CONTROLS.choice && (
            <ChoiceInput
              id={id}
              value={input.value as string}
              onChange={input.onChange}
              options={(field.options ?? []).map(value => ({
                value,
                label: option(value),
              }))}
              noneLabel={t('knowledgeEditor.none')}
            />
          )}
          {field.control === FIELD_CONTROLS.list && (
            <ListInput
              id={id}
              value={input.value as string[]}
              onChange={input.onChange}
              ordered={field.ordered ?? false}
              invalid={invalid}
            />
          )}
          {field.control === FIELD_CONTROLS.alternatives && (
            <AlternativesInput
              id={id}
              value={input.value as AlternativeValue[]}
              onChange={input.onChange}
            />
          )}
          {hint && <FieldDescription>{hint}</FieldDescription>}
          <FieldError errors={[message]} />
        </Field>
      )}
    />
  );
}

function ChoiceInput({
  id,
  value,
  onChange,
  options,
  noneLabel,
}: {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly { value: string; label: string }[];
  readonly noneLabel: string;
}) {
  const items = [{ value: null, label: noneLabel }, ...options];

  return (
    <Select
      items={items}
      value={value || null}
      onValueChange={next => onChange(next ?? '')}
    >
      <SelectTrigger id={id} className='w-full sm:w-72'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(item => (
          <SelectItem key={item.label} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
