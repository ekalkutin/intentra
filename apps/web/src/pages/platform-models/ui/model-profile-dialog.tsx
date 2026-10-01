import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useId, useState, type ReactElement } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  useCreateModelProfileMutation,
  useDeleteModelProfileMutation,
  useEditModelProfileMutation,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  ConfirmDialog,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/shared/ui';
import {
  ReasoningEffortDtoSchema,
  type ModelProfileDto,
  type PlatformAgentDto,
} from '@intentra/contracts/workspace';

import {
  EMPTY_MODEL_PROFILE,
  MODEL_PROFILE_LIMITS,
  modelProfileFormSchema,
  modelProfileValues,
  toSaveModelProfileDto,
  type ModelProfileFormValues,
} from '../model/model-profile-form';
import type { ModelOffer } from '../model/openrouter-models';
import { useModelOffers } from '../model/use-model-offers';

import { ModelPicker } from './model-picker';

/**
 * Creates a built-in Model Profile, or edits or deletes one; empty settings
 * are the model's defaults. Opened by its trigger, or already open on a
 * model chosen in the catalog.
 */
export function ModelProfileDialog({
  profile,
  users = [],
  trigger,
  preset,
  onClosed,
}: {
  /** Null to create one. */
  readonly profile: ModelProfileDto | null;
  /** The Agents on it, named when deleting it. */
  readonly users?: readonly PlatformAgentDto[];
  readonly trigger?: ReactElement;
  /** A model to create a profile on: the dialog opens with it chosen. */
  readonly preset?: ModelOffer;
  readonly onClosed?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const describeError = useDescribeError();
  const [open, setOpenState] = useState(preset !== undefined);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) {
      onClosed?.();
    }
  };
  const [create] = useCreateModelProfileMutation();
  const [edit] = useEditModelProfileMutation();
  const [remove] = useDeleteModelProfileMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const initial = profile
    ? modelProfileValues(profile)
    : preset
      ? {
          ...EMPTY_MODEL_PROFILE,
          name: shortName(preset.name),
          modelId: preset.id,
        }
      : EMPTY_MODEL_PROFILE;
  const form = useForm<ModelProfileFormValues>({
    resolver: zodResolver(modelProfileFormSchema),
    defaultValues: initial,
  });
  const { errors, isSubmitting } = form.formState;
  const offers = useModelOffers(open);
  const modelId = form.watch('modelId');
  const selected = offers.offers?.find(offer => offer.id === modelId);
  /** A model saved earlier that Agents can no longer run on, or one OpenRouter dropped. */
  const unknown = Boolean(offers.offers && modelId && !selected);
  const noTemperature = selected !== undefined && !selected.temperature;
  const noReasoning = selected !== undefined && !selected.reasoning;
  const efforts = [
    { value: '', label: t('platformModels.byDefault') },
    ...ReasoningEffortDtoSchema.options.map(effort => ({
      value: effort,
      label: t(`platformModels.reasoning.${effort}`),
    })),
  ];

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      form.reset(initial);
      setDeleteError(null);
    }
  };

  const deleteProfile = async () => {
    if (!profile) {
      return false;
    }
    const result = await remove(profile.id);
    const error = toApiError(result.error);
    if (error) {
      setDeleteError(describeError(error).text);
      return false;
    }
    setOpen(false);
    return true;
  };

  const submit = form.handleSubmit(async values => {
    const body = toSaveModelProfileDto(values);
    const result = profile
      ? await edit({ modelProfileId: profile.id, body })
      : await create(body);
    const error = toApiError(result.error);
    if (error) {
      form.setError('root', { message: describeError(error).text });
      return;
    }
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={submit} noValidate className='flex flex-col gap-6'>
          <DialogHeader>
            <DialogTitle>
              {profile
                ? t('platformModels.editTitle', { name: profile.name })
                : t('platformModels.createTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('platformModels.dialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor={`${id}-name`}>
                {t('platformModels.name')}
              </FieldLabel>
              <Input
                id={`${id}-name`}
                autoComplete='off'
                maxLength={MODEL_PROFILE_LIMITS.name}
                aria-invalid={Boolean(errors.name)}
                {...form.register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Controller
              control={form.control}
              name='modelId'
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.modelId) || unknown}>
                  <FieldLabel htmlFor={`${id}-model`}>
                    {t('platformModels.modelId')}
                  </FieldLabel>
                  <ModelPicker
                    id={`${id}-model`}
                    value={field.value}
                    onChange={next => {
                      field.onChange(next);
                      const offer = offers.offers?.find(
                        candidate => candidate.id === next,
                      );
                      if (offer && form.getValues('name').trim() === '') {
                        form.setValue('name', shortName(offer.name), {
                          shouldDirty: true,
                        });
                      }
                    }}
                    offers={offers}
                    invalid={Boolean(errors.modelId) || unknown}
                  />
                  {unknown ? (
                    <FieldError>
                      {t('platformModels.picker.unknown')}
                    </FieldError>
                  ) : (
                    errors.modelId && (
                      <FieldError>
                        {t('platformModels.picker.required')}
                      </FieldError>
                    )
                  )}
                </Field>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field data-invalid={Boolean(errors.temperature)}>
                <FieldLabel htmlFor={`${id}-temperature`}>
                  {t('platformModels.temperature')}
                </FieldLabel>
                <Input
                  id={`${id}-temperature`}
                  disabled={noTemperature}
                  inputMode='decimal'
                  autoComplete='off'
                  placeholder={t('platformModels.byDefault')}
                  className='tabular-nums'
                  aria-invalid={Boolean(errors.temperature)}
                  {...form.register('temperature')}
                />
                <FieldDescription>
                  {noTemperature
                    ? t('platformModels.picker.noTemperature')
                    : t('platformModels.temperatureHint')}
                </FieldDescription>
                {errors.temperature && (
                  <FieldError>
                    {t('platformModels.temperatureRange')}
                  </FieldError>
                )}
              </Field>
              <Controller
                control={form.control}
                name='reasoningEffort'
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={`${id}-effort`}>
                      {t('platformModels.reasoningEffort')}
                    </FieldLabel>
                    <Select
                      items={efforts}
                      disabled={noReasoning}
                      value={field.value}
                      onValueChange={next => field.onChange(next ?? '')}
                    >
                      <SelectTrigger id={`${id}-effort`} className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {efforts.map(effort => (
                          <SelectItem key={effort.value} value={effort.value}>
                            {effort.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {noReasoning && (
                      <FieldDescription>
                        {t('platformModels.picker.noReasoning')}
                      </FieldDescription>
                    )}
                  </Field>
                )}
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field data-invalid={Boolean(errors.maxOutputTokens)}>
                <FieldLabel htmlFor={`${id}-tokens`}>
                  {t('platformModels.maxOutputTokens')}
                </FieldLabel>
                <Input
                  id={`${id}-tokens`}
                  inputMode='numeric'
                  autoComplete='off'
                  placeholder={t('platformModels.byDefault')}
                  className='tabular-nums'
                  aria-invalid={Boolean(errors.maxOutputTokens)}
                  {...form.register('maxOutputTokens')}
                />
                <FieldDescription>
                  {selected?.maxOutputTokens
                    ? t('platformModels.picker.maxTokens', {
                        value: selected.maxOutputTokens.toLocaleString(
                          i18n.language,
                        ),
                      })
                    : t('platformModels.maxOutputTokensHint')}
                </FieldDescription>
                {errors.maxOutputTokens && (
                  <FieldError>{t('platformModels.tokensRange')}</FieldError>
                )}
              </Field>
            </div>
          </FieldGroup>
          {errors.root && (
            <Alert variant='destructive'>
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            {profile && (
              <ConfirmDialog
                trigger={
                  <Button
                    type='button'
                    variant='ghost'
                    className='text-destructive hover:text-destructive sm:mr-auto'
                  >
                    <Trash2 />
                    {t('common.delete')}
                  </Button>
                }
                title={t('platformModels.deleteTitle', { name: profile.name })}
                description={
                  users.length === 0
                    ? t('platformModels.deleteDescriptionUnused')
                    : t('platformModels.deleteDescriptionUsed', {
                        agents: users.map(agent => agent.name).join(', '),
                      })
                }
                confirmLabel={t('common.delete')}
                error={deleteError}
                onConfirm={deleteProfile}
              />
            )}
            <DialogClose render={<Button variant='ghost' />}>
              {t('common.cancel')}
            </DialogClose>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {profile ? t('common.save') : t('platformAgent.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** OpenRouter names a model with its vendor, such as `Anthropic: Claude Sonnet 5`; a profile needs only the model. */
function shortName(name: string): string {
  return name.includes(': ') ? name.slice(name.indexOf(': ') + 2) : name;
}
