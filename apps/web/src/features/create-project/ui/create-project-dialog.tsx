import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useCreateProjectMutation } from '@/entities/project';
import { toApiError } from '@/shared/api';
import { projectPath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  NameSlugForm,
  type NameSlug,
} from '@/shared/ui';
import {
  CreateProjectDtoSchema,
  type WorkspaceDto,
} from '@intentra/contracts/workspace';

const FIELDS_BY_CODE = {
  INVALID_PROJECT_NAME: 'name',
  INVALID_PROJECT_SLUG: 'slug',
  PROJECT_SLUG_TAKEN: 'slug',
} as const satisfies Record<string, keyof NameSlug>;

/** Creates a Project in the Workspace and opens it. */
export function CreateProjectDialog({
  workspace,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  readonly workspace: WorkspaceDto;
  /** Opens the dialog; leave it out to open it from elsewhere with `open`. */
  readonly trigger?: ReactElement;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const navigate = useNavigate();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const [createProject] = useCreateProjectMutation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('createProject.title')}</DialogTitle>
          <DialogDescription>
            {t('createProject.description')}
          </DialogDescription>
        </DialogHeader>
        <NameSlugForm
          schema={CreateProjectDtoSchema}
          namePlaceholder={t('createProject.namePlaceholder')}
          submitLabel={t('createProject.submit')}
          footer={
            <DialogClose render={<Button variant='ghost' />}>
              {t('common.cancel')}
            </DialogClose>
          }
          onSubmit={async body => {
            const result = await createProject({
              workspaceId: workspace.id,
              body,
            });
            const error = toApiError(result.error);
            if (error) {
              return describeError(error, FIELDS_BY_CODE);
            }
            setOpen(false);
            if (result.data) {
              void navigate(projectPath(workspace.slug, result.data.slug));
            }
            return null;
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
