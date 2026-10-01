import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useLeaveWorkspaceMutation } from '@/entities/member';
import { forgetLastWorkspaceSlug } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { ROUTES } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import { ConfirmDialog } from '@/shared/ui';
import type { WorkspaceDto } from '@intentra/contracts/workspace';

/** Leaves a Workspace after one question, then goes back to the start. Any Member may. */
export function LeaveWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
}: {
  readonly workspace: WorkspaceDto;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const navigate = useNavigate();
  const [leave] = useLeaveWorkspaceMutation();
  const [failure, setFailure] = useState<string | null>(null);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={next => {
        onOpenChange(next);
        if (!next) {
          setFailure(null);
        }
      }}
      title={t('workspaceSettings.leaveConfirmTitle', { name: workspace.name })}
      description={t('workspaceSettings.leaveDescription')}
      confirmLabel={t('workspaceSettings.leaveConfirm')}
      error={failure}
      onConfirm={async () => {
        const result = await leave(workspace.id);
        const error = toApiError(result.error);
        setFailure(error ? describeError(error).text : null);
        if (!error) {
          forgetLastWorkspaceSlug();
          void navigate(ROUTES.home, { replace: true });
        }
        return !error;
      }}
    />
  );
}
