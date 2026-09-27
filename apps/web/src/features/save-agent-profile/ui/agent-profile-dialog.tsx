import { useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactElement } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { isOrchestrator, type AgentProfile } from '@/entities/agent-profile';
import { useCurrentWorkspace } from '@/entities/workspace';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';
import { Textarea } from '@/shared/ui/textarea';
import {
  CreateAgentProfileDtoSchema,
  type CreateAgentProfileDto,
} from '@intentra/contracts/agents';

import { AGENT_PROFILE_OPTIONS_QUERY } from '../api/agent-profile-options.query';
import { useSaveAgentProfile } from '../model/use-save-agent-profile';

import { ModelCombobox } from './model-combobox';

const EMPTY: CreateAgentProfileDto = {
  name: '',
  description: '',
  instructions: '',
  model: '',
  tools: [],
};

const valuesOf = (profile: AgentProfile | undefined): CreateAgentProfileDto =>
  profile
    ? {
        name: profile.name,
        description: profile.description,
        instructions: profile.instructions,
        model: profile.model,
        tools: profile.tools,
      }
    : EMPTY;

type AgentProfileDialogProps = {
  /** Omitted: the dialog creates a new agent. */
  readonly profile?: AgentProfile;
  readonly trigger: ReactElement;
};

export const AgentProfileDialog = ({
  profile,
  trigger,
}: AgentProfileDialogProps) => {
  const workspace = useCurrentWorkspace();
  const [open, setOpen] = useState(false);
  const { saveAgentProfile, loading } = useSaveAgentProfile(workspace.id);
  const { data: options } = useQuery(AGENT_PROFILE_OPTIONS_QUERY, {
    skip: !open,
  });
  const form = useForm<CreateAgentProfileDto>({
    resolver: zodResolver(CreateAgentProfileDtoSchema),
    defaultValues: valuesOf(profile),
  });
  const orchestrator = profile ? isOrchestrator(profile) : false;
  const tools = options?.agentTools ?? [];

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) form.reset(valuesOf(profile));
  };

  const onSubmit = async (values: CreateAgentProfileDto) => {
    const error = await saveAgentProfile(profile?.id ?? null, values);
    if (error) {
      form.setError('root', { message: error });
      return;
    }
    setOpen(false);
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {profile ? `Edit ${profile.name}` : 'New agent'}
          </DialogTitle>
          <DialogDescription>
            {orchestrator
              ? 'The orchestrator talks to members and delegates to the other agents.'
              : 'The orchestrator delegates to this agent when a request fits its description.'}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-6'
        >
          <FieldGroup>
            {rootError ? (
              <Alert variant='destructive'>
                <AlertDescription>{rootError}</AlertDescription>
              </Alert>
            ) : null}
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='agent-name'>Name</FieldLabel>
                  <Input
                    {...field}
                    id='agent-name'
                    autoComplete='off'
                    placeholder='Security reviewer'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name='description'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='agent-description'>
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id='agent-description'
                    rows={2}
                    placeholder='Finds security risks in code changes.'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>
                      What the agent is good at. The orchestrator reads it to
                      choose whom to delegate to.
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
            <Controller
              name='instructions'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='agent-instructions'>
                    Instructions
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id='agent-instructions'
                    rows={6}
                    placeholder='You review code changes for security risks…'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>
                      The system prompt the agent runs with.
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
            <Controller
              name='model'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='agent-model'>Model</FieldLabel>
                  <ModelCombobox
                    id='agent-model'
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>
                      Any model on OpenRouter.
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
            {tools.length > 0 ? (
              <Controller
                name='tools'
                control={form.control}
                render={({ field }) => {
                  const selected = new Set(field.value ?? []);
                  const toggle = (id: string, checked: boolean) => {
                    if (checked) selected.add(id);
                    else selected.delete(id);
                    field.onChange([...selected]);
                  };
                  return (
                    <FieldSet>
                      <FieldLegend variant='label'>Tools</FieldLegend>
                      {tools.map(tool => (
                        <Field key={tool.id} orientation='horizontal'>
                          <Checkbox
                            id={`agent-tool-${tool.id}`}
                            checked={selected.has(tool.id)}
                            onCheckedChange={checked =>
                              toggle(tool.id, checked)
                            }
                          />
                          <FieldContent>
                            <FieldLabel
                              htmlFor={`agent-tool-${tool.id}`}
                              className='font-mono text-xs'
                            >
                              {tool.id}
                            </FieldLabel>
                            <FieldDescription>
                              {tool.description}
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                      ))}
                    </FieldSet>
                  );
                }}
              />
            ) : null}
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant='outline' />}>
              Cancel
            </DialogClose>
            <Button type='submit' disabled={loading}>
              {loading ? <Spinner data-icon='inline-start' /> : null}
              {profile ? 'Save' : 'Create agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
