import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useCurrentWorkspace } from '@/entities/workspace';
import { Button } from '@/shared/ui/button';
import { FieldError } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group';
import {
  SettingsCard,
  SettingsCardFooter,
  SettingsRow,
} from '@/shared/ui/settings';
import { Spinner } from '@/shared/ui/spinner';
import {
  UpdateWorkspaceDtoSchema,
  type UpdateWorkspaceDto,
} from '@intentra/contracts/workspace';

import { useRenameWorkspace } from '../model/use-rename-workspace';

const ALIAS_HOST = `${window.location.host}/`;

export const RenameWorkspaceForm = () => {
  const workspace = useCurrentWorkspace();
  const { renameWorkspace, loading } = useRenameWorkspace();
  const form = useForm<UpdateWorkspaceDto>({
    resolver: zodResolver(UpdateWorkspaceDtoSchema),
    defaultValues: { name: workspace.name },
  });
  const { reset } = form;

  useEffect(() => {
    reset({ name: workspace.name });
  }, [reset, workspace.name]);

  const onSubmit = async (values: UpdateWorkspaceDto) => {
    const error = await renameWorkspace(workspace.id, values);
    if (error) form.setError('root', { message: error });
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <SettingsCard>
        <Controller
          name='name'
          control={form.control}
          render={({ field, fieldState }) => (
            <SettingsRow
              label='Name'
              description='Shown in the sidebar and to every member.'
              size='text'
            >
              <Input
                {...field}
                autoComplete='off'
                aria-label='Workspace name'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError className='mt-1' errors={[fieldState.error]} />
              ) : null}
            </SettingsRow>
          )}
        />
        <SettingsRow
          label='Alias'
          description='The workspace address. Links use it, so it stays fixed.'
          size='text'
        >
          <InputGroup data-disabled>
            <InputGroupAddon>
              <InputGroupText>{ALIAS_HOST}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              value={workspace.alias}
              readOnly
              disabled
              aria-label='Workspace alias'
            />
          </InputGroup>
        </SettingsRow>
        <SettingsCardFooter>
          {rootError ? (
            <p role='alert' className='mr-auto text-caption text-destructive'>
              {rootError}
            </p>
          ) : null}
          <Button
            type='submit'
            size='sm'
            disabled={!form.formState.isDirty || loading}
          >
            {loading ? <Spinner data-icon='inline-start' /> : null}
            Save
          </Button>
        </SettingsCardFooter>
      </SettingsCard>
    </form>
  );
};
