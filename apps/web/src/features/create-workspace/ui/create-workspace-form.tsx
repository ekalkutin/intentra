import { zodResolver } from '@hookform/resolvers/zod';
import { Dices } from 'lucide-react';
import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  nameToWorkspaceAlias,
  randomWorkspaceIdentity,
} from '@/entities/workspace';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';
import {
  CreateWorkspaceDtoSchema,
  type CreateWorkspaceDto,
} from '@intentra/contracts/workspace';

import { useCreateWorkspace } from '../model/use-create-workspace';

type CreateWorkspaceFormProps = {
  onCreated: () => void;
};

const ALIAS_HOST = `${window.location.host}/`;

export const CreateWorkspaceForm = ({
  onCreated,
}: CreateWorkspaceFormProps) => {
  const { createWorkspace, loading } = useCreateWorkspace();
  const form = useForm<CreateWorkspaceDto>({
    resolver: zodResolver(CreateWorkspaceDtoSchema),
    defaultValues: { name: '', alias: '' },
  });
  // The alias follows the name until the user edits it by hand.
  const aliasTouched = useRef(false);
  const name = useWatch({ control: form.control, name: 'name' }).trim();

  const setAlias = (alias: string) =>
    form.setValue('alias', alias, {
      shouldValidate: form.formState.isSubmitted,
    });

  const rollRandomName = () => {
    const identity = randomWorkspaceIdentity();
    aliasTouched.current = true;
    form.setValue('name', identity.name, {
      shouldValidate: form.formState.isSubmitted,
    });
    setAlias(identity.alias);
  };

  const onSubmit = async (values: CreateWorkspaceDto) => {
    const failure = await createWorkspace({
      name: values.name.trim(),
      alias: values.alias,
    });
    if (!failure) {
      onCreated();
      return;
    }
    form.setError(failure.aliasTaken ? 'alias' : 'root', {
      message: failure.message,
    });
  };

  const rootError = form.formState.errors.root?.message;

  return (
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
              <FieldLabel htmlFor='workspace-name'>Workspace name</FieldLabel>
              <div className='flex items-center gap-2'>
                <Input
                  {...field}
                  id='workspace-name'
                  autoFocus
                  autoComplete='off'
                  placeholder='Acme Labs'
                  className='min-w-0'
                  aria-invalid={fieldState.invalid}
                  onChange={event => {
                    field.onChange(event);
                    if (!aliasTouched.current) {
                      setAlias(nameToWorkspaceAlias(event.target.value));
                    }
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={rollRandomName}
                  disabled={loading}
                  className='shrink-0'
                >
                  <Dices />
                  Random
                </Button>
              </div>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name='alias'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='workspace-alias'>Alias</FieldLabel>
              <div
                aria-invalid={fieldState.invalid}
                className='flex items-center rounded-lg border border-input bg-muted transition-colors focus-within:border-ring aria-invalid:border-destructive'
              >
                <span className='select-none pl-2.5 font-mono text-body text-muted-foreground'>
                  {ALIAS_HOST}
                </span>
                <Input
                  {...field}
                  id='workspace-alias'
                  autoComplete='off'
                  autoCapitalize='none'
                  spellCheck={false}
                  placeholder='acme-labs'
                  className='border-0 bg-transparent pl-0 font-mono shadow-none focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent'
                  aria-invalid={fieldState.invalid}
                  onChange={event => {
                    aliasTouched.current = true;
                    field.onChange(event.target.value.toLowerCase());
                  }}
                />
              </div>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Your workspace address. Lowercase letters, digits and hyphens.
                </FieldDescription>
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <div className='flex flex-col gap-2'>
        <p aria-live='polite' className='text-caption text-muted-foreground'>
          {loading
            ? `Creating ${name || 'your workspace'}…`
            : name
              ? `You can invite your team once ${name} is ready.`
              : 'Name your workspace to continue.'}
        </p>
        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? <Spinner /> : null}
          {name ? `Create ${name}` : 'Create workspace'}
        </Button>
      </div>
    </form>
  );
};
