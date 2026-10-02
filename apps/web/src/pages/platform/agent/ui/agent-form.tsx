import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import {
  ChangeBadge,
  useCreateAgentMutation,
  useDeleteAgentMutation,
  useEditAgentMutation,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import {
  PLATFORM_PAGES,
  platformAgentPath,
  platformPath,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import { cn } from '@/shared/lib';
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
  MultiPicker,
  Page,
  PageHeader,
  PageSection,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  StatusBadge,
  Textarea,
  UnsavedChangesGuard,
} from '@/shared/ui';
import {
  AgentRoleDtoSchema,
  type AgentRoleDto,
  type AgentsChangeKindDto,
  type AgentsContentDto,
  type AgentToolDto,
  type PlatformAgentDto,
} from '@intentra/contracts/workspace';

import {
  AGENT_LIMITS,
  agentFormSchema,
  agentValues,
  toSaveAgentDto,
  type AgentFormValues,
} from '../model/agent-form';

import { ChosenList, type ChosenItem } from './chosen-list';

/**
 * One Agent: its texts on the left, what it runs on and may use on the
 * right. Saving keeps the change in the Unpublished Agents; leaving with
 * unsaved changes asks first.
 */
export function AgentForm({
  back,
  role,
  agent,
  initial,
  content,
  tools,
  changeKind,
}: {
  readonly back: { readonly to: string; readonly label: string };
  readonly role: AgentRoleDto;
  /** Null while creating one. */
  readonly agent: PlatformAgentDto | null;
  readonly initial: AgentFormValues;
  readonly content: AgentsContentDto;
  readonly tools: readonly AgentToolDto[];
  readonly changeKind: AgentsChangeKindDto | null;
}) {
  const { t } = useTranslation();
  const id = useId();
  const navigate = useNavigate();
  const describeError = useDescribeError();
  const saved = useRef(false);
  const [create] = useCreateAgentMutation();
  const [edit] = useEditAgentMutation();
  const [remove] = useDeleteAgentMutation();
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: initial,
  });
  const { errors, isSubmitting, isDirty } = form.formState;
  const isIntentra = role === AgentRoleDtoSchema.enum.intentra;
  const roleName = t(`platform.roles.${role}`);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const submit = form.handleSubmit(async values => {
    const body = toSaveAgentDto(values, isIntentra);
    const result = agent
      ? await edit({ agentId: agent.id, body })
      : await create({ ...body, role });
    const error = toApiError(result.error);
    if (error) {
      form.setError('root', { message: describeError(error).text });
      return;
    }
    if (!result.data) {
      return;
    }
    if (agent) {
      form.reset(agentValues(result.data));
      return;
    }
    saved.current = true;
    void navigate(platformAgentPath({ id: result.data.id }), {
      replace: true,
    });
  });

  const deleteAgent = async () => {
    if (!agent) {
      return false;
    }
    const result = await remove(agent.id);
    const error = toApiError(result.error);
    if (error) {
      setDeleteError(describeError(error).text);
      return false;
    }
    saved.current = true;
    void navigate(platformPath(PLATFORM_PAGES.agents), { replace: true });
    return true;
  };

  const specialists = content.agents.filter(
    other => other.role === AgentRoleDtoSchema.enum.specialist,
  );
  const profiles = content.modelProfiles.map(profile => ({
    value: profile.id,
    label: profile.name,
  }));

  return (
    <Page className='pb-0'>
      <BackLink {...back} />
      <PageHeader
        title={
          agent ? agent.name : t('platformAgent.titleNew', { role: roleName })
        }
        description={
          isIntentra
            ? t('platformAgent.aboutIntentra')
            : t('platformAgent.aboutSpecialist')
        }
      />
      <form
        onSubmit={submit}
        noValidate
        className='grid gap-10 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-12'
      >
        <FieldGroup className='min-w-0'>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor={`${id}-name`}>
              {t('platformAgent.name')}
            </FieldLabel>
            <Input
              id={`${id}-name`}
              autoComplete='off'
              autoFocus={!agent}
              maxLength={AGENT_LIMITS.name}
              className='max-w-lg'
              aria-invalid={Boolean(errors.name)}
              {...form.register('name')}
            />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor={`${id}-description`}>
              {t('platformAgent.description')}
            </FieldLabel>
            <Textarea
              id={`${id}-description`}
              rows={2}
              maxLength={AGENT_LIMITS.description}
              aria-invalid={Boolean(errors.description)}
              {...form.register('description')}
            />
            <FieldDescription>
              {isIntentra
                ? t('platformAgent.descriptionHintIntentra')
                : t('platformAgent.descriptionHintSpecialist')}
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
                      {t('platformAgent.instructions')}
                    </FieldLabel>
                  }
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  maxLength={AGENT_LIMITS.instructions}
                  invalid={Boolean(errors.instructions)}
                />
                <FieldDescription>
                  {t('platformAgent.instructionsHint')}
                </FieldDescription>
                <FieldError errors={[errors.instructions]} />
              </Field>
            )}
          />
        </FieldGroup>
        <aside className='flex min-w-0 flex-col gap-8 xl:border-l xl:border-border xl:pl-8'>
          {agent && (
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
          <Controller
            control={form.control}
            name='modelProfileId'
            render={({ field }) => (
              <Field data-invalid={Boolean(errors.modelProfileId)}>
                <FieldLabel
                  htmlFor={`${id}-model`}
                  className='text-sm font-semibold'
                >
                  {t('platformAgent.modelProfile')}
                </FieldLabel>
                <Select
                  items={profiles}
                  value={field.value || null}
                  onValueChange={next => field.onChange(next ?? '')}
                >
                  <SelectTrigger
                    id={`${id}-model`}
                    className='w-full'
                    aria-invalid={Boolean(errors.modelProfileId)}
                  >
                    <SelectValue
                      placeholder={t('platformAgent.chooseModelProfile')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(profile => (
                      <SelectItem key={profile.value} value={profile.value}>
                        {profile.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.modelProfileId && (
                  <FieldError>
                    {t('platformAgent.chooseModelProfile')}
                  </FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name='skillIds'
            render={({ field }) => (
              <PageSection
                title={t('platformAgent.skills')}
                actions={
                  <MultiPicker
                    value={field.value}
                    onChange={field.onChange}
                    triggerLabel={t('platformAgent.choose')}
                    searchPlaceholder={t('platformAgent.skillsSearch')}
                    emptyText={t('platformAgent.skillsEmpty')}
                    groups={[
                      {
                        heading: t('platformAgent.skills'),
                        options: content.skills.map(skill => ({
                          id: skill.id,
                          label: skill.name,
                          hint: skill.description,
                          mono: true,
                        })),
                      },
                    ]}
                  />
                }
              >
                <ChosenList
                  empty={t('platformAgent.skillsNone')}
                  items={content.skills
                    .filter(skill => field.value.includes(skill.id))
                    .map(skill => ({
                      id: skill.id,
                      label: skill.name,
                      mono: true,
                      title: skill.description,
                    }))}
                />
              </PageSection>
            )}
          />
          {isIntentra && (
            <Controller
              control={form.control}
              name='specialistIds'
              render={({ field }) => (
                <PageSection
                  title={t('platformAgent.specialists')}
                  actions={
                    <MultiPicker
                      value={field.value}
                      onChange={field.onChange}
                      triggerLabel={t('platformAgent.choose')}
                      searchPlaceholder={t('platformAgent.specialistsSearch')}
                      emptyText={t('platformAgent.specialistsEmpty')}
                      groups={[
                        {
                          heading: t('platformAgent.specialists'),
                          options: specialists.map(specialist => ({
                            id: specialist.id,
                            label: specialist.name,
                            hint: specialist.description,
                          })),
                        },
                      ]}
                    />
                  }
                >
                  <ChosenList
                    empty={t('platformAgent.specialistsNone')}
                    items={specialists
                      .filter(specialist => field.value.includes(specialist.id))
                      .map(specialist => ({
                        id: specialist.id,
                        label: specialist.name,
                        to: platformAgentPath({ id: specialist.id }),
                      }))}
                  />
                  <p className='text-sm text-pretty text-muted-foreground'>
                    {t('platformAgent.specialistsHint')}
                  </p>
                </PageSection>
              )}
            />
          )}
          <Controller
            control={form.control}
            name='tools'
            render={({ field }) => (
              <PageSection
                title={t('platformAgent.tools')}
                actions={
                  <MultiPicker
                    value={field.value}
                    onChange={field.onChange}
                    triggerLabel={t('platformAgent.choose')}
                    searchPlaceholder={t('platformAgent.toolsSearch')}
                    emptyText={t('platformAgent.toolsEmpty')}
                    groups={[
                      {
                        heading: t('platformAgent.readGroup'),
                        options: tools
                          .filter(tool => tool.readOnly)
                          .map(tool => ({
                            id: tool.id,
                            label: tool.id,
                            hint: tool.description,
                            mono: true,
                          })),
                      },
                      {
                        heading: t('platformAgent.writeGroup'),
                        options: tools
                          .filter(tool => !tool.readOnly)
                          .map(tool => ({
                            id: tool.id,
                            label: tool.id,
                            hint: tool.description,
                            mono: true,
                          })),
                      },
                    ]}
                  />
                }
              >
                <ChosenTools
                  chosen={field.value}
                  tools={tools}
                  empty={t('platformAgent.toolsNone')}
                />
                <p className='text-sm text-pretty text-muted-foreground'>
                  {t('platformAgent.toolsHint')}
                </p>
              </PageSection>
            )}
          />
          {agent && !isIntentra && (
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
                    {t('platformAgent.delete')}
                  </Button>
                }
                title={t('platformAgent.deleteTitle', { name: agent.name })}
                description={t('platformAgent.deleteDescription')}
                confirmLabel={t('common.delete')}
                error={deleteError}
                onConfirm={deleteAgent}
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
            disabled={isSubmitting || (agent !== null && !isDirty)}
          >
            {isSubmitting && <Spinner />}
            {agent ? t('common.save') : t('platformAgent.create')}
          </Button>
        </div>
      </form>
      <UnsavedChangesGuard when={isDirty} saved={saved} />
    </Page>
  );
}

/** A group of chosen tools under its count, folded until opened. */
function ToolGroup({
  heading,
  children,
}: {
  readonly heading: string;
  readonly children: readonly ChosenItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex flex-col gap-1.5'>
      <button
        type='button'
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className='-mx-1 flex items-center gap-1 self-start rounded-md px-1 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50'
      >
        <ChevronRight
          aria-hidden
          className={cn(
            'size-3.5 text-muted-foreground transition-transform',
            open && 'rotate-90',
          )}
        />
        <Trans
          i18nKey='platformAgent.chosenGroup'
          values={{ group: heading, count: children.length }}
          components={{
            mono: <span className='font-mono text-xs tabular-nums' />,
          }}
        />
      </button>
      {open && (
        <div className='pl-4.5'>
          <ChosenList empty='' items={children} />
        </div>
      )}
    </div>
  );
}

/**
 * The Agent's tools in two groups, those that only read and those that
 * write; a tool the code no longer has is marked.
 */
function ChosenTools({
  chosen,
  tools,
  empty,
}: {
  readonly chosen: readonly string[];
  readonly tools: readonly AgentToolDto[];
  readonly empty: string;
}) {
  const { t } = useTranslation();
  if (chosen.length === 0) {
    return <p className='text-sm text-muted-foreground'>{empty}</p>;
  }
  const byId = new Map(tools.map(tool => [tool.id, tool]));
  const missing = chosen.filter(id => !byId.has(id));
  const groups = [
    {
      heading: t('platformAgent.readGroup'),
      ids: tools
        .filter(tool => tool.readOnly && chosen.includes(tool.id))
        .map(tool => tool.id),
    },
    {
      heading: t('platformAgent.writeGroup'),
      ids: tools
        .filter(tool => !tool.readOnly && chosen.includes(tool.id))
        .map(tool => tool.id),
    },
  ].filter(group => group.ids.length > 0);

  return (
    <div className='flex flex-col gap-4'>
      {missing.length > 0 && (
        <ChosenList
          empty=''
          items={missing.map(id => ({
            id,
            label: id,
            mono: true,
            mark: (
              <StatusBadge status='review'>
                {t('platformAgent.toolMissing')}
              </StatusBadge>
            ),
          }))}
        />
      )}
      {groups.map(group => (
        <ToolGroup key={group.heading} heading={group.heading}>
          {group.ids.map(id => ({
            id,
            label: id,
            mono: true,
            title: byId.get(id)?.description,
          }))}
        </ToolGroup>
      ))}
    </div>
  );
}
