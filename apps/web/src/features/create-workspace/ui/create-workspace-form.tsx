import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useCreateWorkspaceMutation } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { workspacePath } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import { NameSlugForm, type NameSlug } from '@/shared/ui';
import { CreateWorkspaceDtoSchema } from '@intentra/contracts/workspace';

const FIELDS_BY_CODE = {
  INVALID_WORKSPACE_NAME: 'name',
  INVALID_WORKSPACE_SLUG: 'slug',
  WORKSPACE_SLUG_TAKEN: 'slug',
} as const satisfies Record<string, keyof NameSlug>;

/** Creates a Workspace and opens it. */
export function CreateWorkspaceForm({
  footer,
  onCreated,
}: {
  readonly footer?: ReactNode;
  readonly onCreated?: () => void;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const navigate = useNavigate();
  const [createWorkspace] = useCreateWorkspaceMutation();

  return (
    <NameSlugForm
      schema={CreateWorkspaceDtoSchema}
      namePlaceholder={t('createWorkspace.namePlaceholder')}
      submitLabel={t('createWorkspace.submit')}
      footer={footer}
      onSubmit={async values => {
        const result = await createWorkspace(values);
        const error = toApiError(result.error);
        if (error) {
          return describeError(error, FIELDS_BY_CODE);
        }
        onCreated?.();
        if (result.data) {
          void navigate(workspacePath(result.data.slug));
        }
        return null;
      }}
    />
  );
}
