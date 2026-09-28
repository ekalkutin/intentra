import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { generatePath, useNavigate } from 'react-router';

import { useCurrentWorkspace } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';
import { Textarea } from '@/shared/ui/textarea';
import {
  CreateProjectDtoSchema,
  type CreateProjectDto,
} from '@intentra/contracts/workspace';

import { useCreateProject } from '../model/use-create-project';

const FormSchema = CreateProjectDtoSchema.omit({ workspaceId: true });
type FormValues = Omit<CreateProjectDto, 'workspaceId'>;

/** Creates a project in the current workspace and opens it. */
export const CreateProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const workspace = useCurrentWorkspace();
  const navigate = useNavigate();
  const { createProject, loading } = useCreateProject();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', description: '' },
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  const onSubmit = async ({ name, description }: FormValues) => {
    const result = await createProject({
      workspaceId: workspace.id,
      name,
      description: description || undefined,
    });
    if (result.error !== undefined) {
      form.setError('root', { message: result.error });
      return;
    }
    onOpenChange(false);
    void navigate(
      generatePath(ROUTES.WORKSPACE.PROJECT.ROOT, {
        alias: workspace.alias,
        projectId: result.project.id,
      }),
    );
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button size='sm' />}>
        <PlusIcon data-icon='inline-start' />
        New project
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Every member of {workspace.name} will see it.
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
                  <FieldLabel htmlFor='project-name'>Name</FieldLabel>
                  <Input
                    {...field}
                    id='project-name'
                    autoFocus
                    autoComplete='off'
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
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor='project-description'>
                    Description
                  </FieldLabel>
                  <Textarea {...field} id='project-description' rows={3} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant='outline' />}>
              Cancel
            </DialogClose>
            <Button type='submit' disabled={loading}>
              {loading ? <Spinner data-icon='inline-start' /> : null}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
