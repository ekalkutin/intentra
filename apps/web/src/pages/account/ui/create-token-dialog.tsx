import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { useCreatePersonalAccessTokenMutation } from '@/entities/personal-access-token';
import { onlyWorkspaceId, WorkspaceSelect } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  CopyField,
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
  CreatePersonalAccessTokenDtoSchema,
  ProjectRoleDtoSchema,
  type WorkspaceDto,
} from '@intentra/contracts/workspace';

import { AgentConnect } from './agent-connect';

type FormInput = z.input<typeof CreatePersonalAccessTokenDtoSchema>;
type FormOutput = z.output<typeof CreatePersonalAccessTokenDtoSchema>;
type Lifetime = FormOutput['lifetimeDays'];

const FIELDS_BY_CODE = {
  INVALID_PERSONAL_ACCESS_TOKEN_NAME: 'name',
  INVALID_PERSONAL_ACCESS_TOKEN_LIFETIME: 'lifetimeDays',
} as const satisfies Record<string, keyof FormInput>;

const LIFETIMES = [
  { value: 30, labelKey: 'days30' },
  { value: 90, labelKey: 'days90' },
  { value: 365, labelKey: 'days365' },
  { value: null, labelKey: 'never' },
] as const satisfies readonly { value: Lifetime; labelKey: string }[];

/**
 * Creates a Personal Access Token in one of the person's Workspaces, then
 * shows its secret once, with a way to copy it; closing the dialog forgets
 * the secret.
 */
export function CreateTokenDialog({
  workspaces,
}: {
  readonly workspaces: readonly WorkspaceDto[];
}) {
  const { t } = useTranslation();
  const id = useId();
  const describeError = useDescribeError();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    readonly workspaceSlug: string;
    readonly secret: string;
  } | null>(null);
  const workspaceId = picked ?? onlyWorkspaceId(workspaces);
  const workspace = workspaces.find(candidate => candidate.id === workspaceId);
  const [create] = useCreatePersonalAccessTokenMutation();
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(CreatePersonalAccessTokenDtoSchema),
    defaultValues: {
      name: '',
      level: ProjectRoleDtoSchema.enum.contributor,
      lifetimeDays: 90,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const levels = ProjectRoleDtoSchema.options.map(level => ({
    value: level,
    label: t(`projectRoles.${level}`),
  }));
  const lifetimes = LIFETIMES.map(lifetime => ({
    value: lifetime.value,
    label: t(`lifetimes.${lifetime.labelKey}`),
  }));

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setCreated(null);
      setPicked(null);
      form.reset();
    }
  };

  const submit = form.handleSubmit(async body => {
    if (!workspace) {
      return;
    }
    const result = await create({ workspaceId: workspace.id, body });
    const error = toApiError(result.error);
    if (error) {
      const { field, text } = describeError(error, FIELDS_BY_CODE);
      form.setError(field ?? 'root', { message: text });
      return;
    }
    setCreated(
      result.data
        ? { workspaceSlug: workspace.slug, secret: result.data.secret }
        : null,
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            {t('tokens.create')}
          </Button>
        }
      />
      <DialogContent className={created ? 'sm:max-w-2xl' : 'sm:max-w-md'}>
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('tokens.secretTitle')}</DialogTitle>
              <DialogDescription>
                {t('tokens.secretDescription')}
              </DialogDescription>
            </DialogHeader>
            <CopyField value={created.secret} label={t('tokens.secretTitle')} />
            <AgentConnect
              workspaceSlug={created.workspaceSlug}
              secret={created.secret}
            />
            <DialogFooter>
              <DialogClose render={<Button />}>
                {t('tokens.secretDone')}
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('tokens.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('tokens.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel>{t('tokens.workspace')}</FieldLabel>
                  <WorkspaceSelect
                    workspaces={workspaces}
                    value={workspaceId}
                    onValueChange={setPicked}
                  />
                </Field>
                <Field data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor={`${id}-name`}>
                    {t('tokens.name')}
                  </FieldLabel>
                  <Input
                    id={`${id}-name`}
                    autoComplete='off'
                    autoFocus
                    placeholder={t('tokens.namePlaceholder')}
                    aria-invalid={Boolean(errors.name)}
                    {...form.register('name')}
                  />
                  <FieldError errors={[errors.name]} />
                </Field>
                <Controller
                  control={form.control}
                  name='level'
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>{t('tokens.level')}</FieldLabel>
                      <Select
                        items={levels}
                        value={field.value}
                        onValueChange={value => value && field.onChange(value)}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {t(`projectRoles.${field.value}Hint`)}
                      </FieldDescription>
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name='lifetimeDays'
                  render={({ field }) => (
                    <Field data-invalid={Boolean(errors.lifetimeDays)}>
                      <FieldLabel>{t('tokens.lifetime')}</FieldLabel>
                      <Select
                        items={lifetimes}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {lifetimes.map(lifetime => (
                            <SelectItem
                              key={lifetime.label}
                              value={lifetime.value}
                            >
                              {lifetime.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[errors.lifetimeDays]} />
                    </Field>
                  )}
                />
                {errors.root && (
                  <Alert variant='destructive'>
                    <AlertDescription>{errors.root.message}</AlertDescription>
                  </Alert>
                )}
                <DialogFooter>
                  <DialogClose render={<Button variant='ghost' />}>
                    {t('common.cancel')}
                  </DialogClose>
                  <Button type='submit' disabled={isSubmitting || !workspace}>
                    {isSubmitting && <Spinner />}
                    {t('tokens.submit')}
                  </Button>
                </DialogFooter>
              </FieldGroup>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
