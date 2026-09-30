import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  useCreateProjectMutation,
  useCreateWorkspaceMutation,
} from '@/api/workspace-api';
import { ErrorAlert, Spinner } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SLUG_MAX, SLUG_PATTERN, slugify } from '@/lib/format';

type NameSlugDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  busy: boolean;
  error: unknown;
  onSubmit: (value: { name: string; slug: string }) => void;
};

function NameSlugDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  busy,
  error,
  onSubmit,
}: NameSlugDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  const change = (next: boolean) => {
    if (!next) {
      setName('');
      setSlug('');
      setSlugTouched(false);
    }
    onOpenChange(next);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ name: name.trim(), slug });
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent>
        <form onSubmit={submit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='name'>Название</Label>
            <Input
              id='name'
              autoFocus
              required
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='slug'>Слаг (короткий адрес)</Label>
            <Input
              id='slug'
              required
              minLength={3}
              maxLength={SLUG_MAX}
              pattern={SLUG_PATTERN}
              title='От 3 до 15 строчных латинских букв, цифр или одиночных дефисов'
              className='font-mono'
              value={slug}
              onChange={e => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
            <p className='text-xs text-muted-foreground'>
              3–15 строчных латинских букв, цифр или одиночных дефисов. Название
              и слаг задаются один раз и потом не меняются.
            </p>
          </div>
          <ErrorAlert error={error} />
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => change(false)}
            >
              Отмена
            </Button>
            <Button type='submit' disabled={busy || !name.trim() || !slug}>
              {busy && <Spinner />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [create, state] = useCreateWorkspaceMutation();
  const navigate = useNavigate();

  return (
    <NameSlugDialog
      open={open}
      onOpenChange={next => {
        if (!next) state.reset();
        onOpenChange(next);
      }}
      title='Новое пространство'
      description='Пространство объединяет людей и их проекты. Вы станете его Владельцем.'
      submitLabel='Создать пространство'
      busy={state.isLoading}
      error={state.error}
      onSubmit={async value => {
        const workspace = await create(value)
          .unwrap()
          .catch(() => null);
        if (!workspace) return;
        toast.success(`Пространство «${workspace.name}» создано`);
        onOpenChange(false);
        navigate(`/w/${workspace.id}`);
      }}
    />
  );
}

export function CreateProjectDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [create, state] = useCreateProjectMutation();
  const navigate = useNavigate();

  return (
    <NameSlugDialog
      open={open}
      onOpenChange={next => {
        if (!next) state.reset();
        onOpenChange(next);
      }}
      title='Новый проект'
      description='Проект хранит структурированные знания об одном программном продукте. Вы станете его Сопровождающим.'
      submitLabel='Создать проект'
      busy={state.isLoading}
      error={state.error}
      onSubmit={async value => {
        const project = await create({ workspaceId, ...value })
          .unwrap()
          .catch(() => null);
        if (!project) return;
        toast.success(`Проект «${project.name}» создан`);
        onOpenChange(false);
        navigate(`/w/${workspaceId}/p/${project.id}`);
      }}
    />
  );
}
