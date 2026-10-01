import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import {
  ChangeBadge,
  PLATFORM_AGENTS_ERROR_CODES,
  useCreateSkillMutation,
  useDeleteSkillMutation,
  useEditSkillMutation,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import {
  PLATFORM_PAGES,
  platformAgentPath,
  platformPath,
  platformSkillPath,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  BackLink,
  Button,
  ConfirmDialog,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  MarkdownEditor,
  Page,
  PageHeader,
  PageSection,
  Spinner,
  StatusBadge,
  Textarea,
  UnsavedChangesGuard,
} from '@/shared/ui';
import type {
  AgentsChangeKindDto,
  PlatformAgentDto,
  SkillDto,
} from '@intentra/contracts/workspace';

import {
  SKILL_LIMITS,
  skillFormSchema,
  skillValues,
  toSaveSkillDto,
  type SkillFormValues,
} from '../model/skill-form';

/**
 * One Skill: its name, description and instructions on the left, the Agents
 * using it on the right. Leaving with unsaved changes asks first.
 */
export function SkillForm({
  back,
  skill,
  initial,
  agents,
  changeKind,
}: {
  readonly back: { readonly to: string; readonly label: string };
  /** Null while creating one. */
  readonly skill: SkillDto | null;
  readonly initial: SkillFormValues;
  readonly agents: readonly PlatformAgentDto[];
  readonly changeKind: AgentsChangeKindDto | null;
}) {
  const { t } = useTranslation();
  const id = useId();
  const navigate = useNavigate();
  const describeError = useDescribeError();
  const saved = useRef(false);
  const [create] = useCreateSkillMutation();
  const [edit] = useEditSkillMutation();
  const [remove] = useDeleteSkillMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: initial,
  });
  const { errors, isSubmitting, isDirty } = form.formState;
  const users = skill
    ? agents.filter(agent => agent.skillIds.includes(skill.id))
    : [];

  const submit = form.handleSubmit(async values => {
    const body = toSaveSkillDto(values);
    const result = skill
      ? await edit({ skillId: skill.id, body })
      : await create(body);
    const error = toApiError(result.error);
    if (error) {
      const { text } = describeError(error);
      form.setError(
        error.code === PLATFORM_AGENTS_ERROR_CODES.skillNameTaken
          ? 'name'
          : 'root',
        { message: text },
      );
      return;
    }
    if (!result.data) {
      return;
    }
    if (skill) {
      form.reset(skillValues(result.data));
      return;
    }
    saved.current = true;
    void navigate(platformSkillPath(result.data.id), { replace: true });
  });

  const deleteSkill = async () => {
    if (!skill) {
      return false;
    }
    const result = await remove(skill.id);
    const error = toApiError(result.error);
    if (error) {
      setDeleteError(describeError(error).text);
      return false;
    }
    saved.current = true;
    void navigate(platformPath(PLATFORM_PAGES.skills), { replace: true });
    return true;
  };

  return (
    <Page className='pb-0'>
      <BackLink {...back} />
      <PageHeader
        title={
          skill ? (
            <span className='font-mono'>{skill.name}</span>
          ) : (
            t('platformSkill.titleNew')
          )
        }
        description={t('platformSkill.about')}
      />
      <form
        onSubmit={submit}
        noValidate
        className='grid gap-10 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-12'
      >
        <FieldGroup className='min-w-0'>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor={`${id}-name`}>
              {t('platformSkill.name')}
            </FieldLabel>
            <Input
              id={`${id}-name`}
              autoComplete='off'
              spellCheck={false}
              autoFocus={!skill}
              maxLength={SKILL_LIMITS.name}
              className='max-w-lg font-mono'
              aria-invalid={Boolean(errors.name)}
              {...form.register('name')}
            />
            <FieldDescription>{t('platformSkill.nameHint')}</FieldDescription>
            {errors.name && (
              <FieldError>
                {errors.name.type === 'invalid_format'
                  ? t('platformSkill.nameFormat')
                  : errors.name.message}
              </FieldError>
            )}
          </Field>
          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor={`${id}-description`}>
              {t('platformSkill.description')}
            </FieldLabel>
            <Textarea
              id={`${id}-description`}
              rows={2}
              maxLength={SKILL_LIMITS.description}
              aria-invalid={Boolean(errors.description)}
              {...form.register('description')}
            />
            <FieldDescription>
              {t('platformSkill.descriptionHint')}
            </FieldDescription>
            <FieldError errors={[errors.description]} />
          </Field>
          <Controller
            control={form.control}
            name='instructions'
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.instructions)}>
                <MarkdownEditor
                  id={`${id}-instructions`}
                  label={
                    <FieldLabel htmlFor={`${id}-instructions`}>
                      {t('platformSkill.instructions')}
                    </FieldLabel>
                  }
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={SKILL_LIMITS.instructions}
                  invalid={Boolean(errors.instructions)}
                />
                <FieldError errors={[errors.instructions]} />
              </Field>
            )}
          />
        </FieldGroup>
        <aside className='flex min-w-0 flex-col gap-8 xl:border-l xl:border-border xl:pl-8'>
          {skill && (
            <PageSection title={t('platform.status')}>
              <div>
                {changeKind ? (
                  <ChangeBadge kind={changeKind} />
                ) : (
                  <StatusBadge status='done'>
                    {t('platform.unchanged')}
                  </StatusBadge>
                )}
              </div>
            </PageSection>
          )}
          {skill && (
            <PageSection title={t('platformSkill.usedBy')}>
              {users.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  {t('platformSkill.usedByNone')}
                </p>
              ) : (
                <ul className='flex flex-col gap-1.5'>
                  {users.map(agent => (
                    <li key={agent.id} className='text-sm leading-5'>
                      <Link
                        to={platformAgentPath({ id: agent.id })}
                        className='underline underline-offset-[0.2em]'
                      >
                        {agent.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </PageSection>
          )}
          {skill && (
            <div>
              <ConfirmDialog
                trigger={
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='-ml-2 text-destructive hover:text-destructive'
                  >
                    <Trash2 />
                    {t('platformSkill.delete')}
                  </Button>
                }
                title={t('platformSkill.deleteTitle', { name: skill.name })}
                description={
                  users.length === 0
                    ? t('platformSkill.deleteDescriptionUnused')
                    : t('platformSkill.deleteDescriptionUsed', {
                        agents: users.map(agent => agent.name).join(', '),
                      })
                }
                confirmLabel={t('common.delete')}
                error={deleteError}
                onConfirm={deleteSkill}
              />
            </div>
          )}
        </aside>
        <div className='sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background py-3 xl:col-span-2'>
          {errors.root && (
            <Alert variant='destructive' className='mr-auto w-auto py-1.5'>
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}
          <Button
            variant='ghost'
            render={<Link to={back.to} />}
            nativeButton={false}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting || (skill !== null && !isDirty)}
          >
            {isSubmitting && <Spinner />}
            {skill ? t('common.save') : t('platformAgent.create')}
          </Button>
        </div>
      </form>
      <UnsavedChangesGuard when={isDirty} saved={saved} />
    </Page>
  );
}
