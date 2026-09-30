import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  INVITATION_STATUSES,
  useInvitationsQuery,
  useInviteMutation,
  useRevokeInvitationMutation,
} from '@/entities/invitation';
import { toApiError } from '@/shared/api';
import { useDescribeError, useFormatDate } from '@/shared/i18n';
import {
  Button,
  Field,
  FieldError,
  Input,
  ListEmpty,
  ListRow,
  ListSkeleton,
  LoadError,
  Spinner,
  StatusBadge,
} from '@/shared/ui';
import {
  CreateInvitationDtoSchema,
  type CreateInvitationDto,
  type InvitationDto,
  type WorkspaceDto,
} from '@intentra/contracts/workspace';

const FIELDS_BY_CODE = {
  INVITATION_ALREADY_PENDING: 'email',
  ALREADY_WORKSPACE_MEMBER: 'email',
} as const satisfies Record<string, keyof CreateInvitationDto>;

/** How each invitation status shows. */
const STATUSES = {
  [INVITATION_STATUSES.pending]: 'pending',
  [INVITATION_STATUSES.accepted]: 'done',
  [INVITATION_STATUSES.declined]: 'declined',
  [INVITATION_STATUSES.revoked]: 'declined',
  [INVITATION_STATUSES.expired]: 'inactive',
} as const;

/** Invites someone by email. */
export function InviteForm({
  workspace,
}: {
  readonly workspace: WorkspaceDto;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [invite] = useInviteMutation();
  const form = useForm<CreateInvitationDto>({
    resolver: zodResolver(CreateInvitationDtoSchema),
    defaultValues: { email: '' },
  });
  const { errors, isSubmitting } = form.formState;

  const submit = form.handleSubmit(async body => {
    const result = await invite({ workspaceId: workspace.id, body });
    const error = toApiError(result.error);
    if (error) {
      const { field, text } = describeError(error, FIELDS_BY_CODE);
      form.setError(field ?? 'email', { message: text });
      return;
    }
    form.reset();
  });

  return (
    <div>
      <form
        onSubmit={submit}
        noValidate
        className='flex max-w-lg items-start gap-2'
      >
        <Field data-invalid={Boolean(errors.email)} className='flex-1'>
          <Input
            type='email'
            autoComplete='off'
            placeholder={t('members.inviteEmail')}
            aria-label={t('members.inviteEmail')}
            aria-invalid={Boolean(errors.email)}
            {...form.register('email')}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Button type='submit' variant='outline' disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : <Send />}
          {t('members.invite')}
        </Button>
      </form>
    </div>
  );
}

/** The Workspace's invitations, the newest first. */
export function InvitationRows({
  workspace,
}: {
  readonly workspace: WorkspaceDto;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { data, isLoading, error, refetch } = useInvitationsQuery(workspace.id);
  const loadError = toApiError(error);
  const invitations = [...(data ?? [])].sort((a, b) =>
    b.sentAt.localeCompare(a.sentAt),
  );

  return (
    <>
      {isLoading && <ListSkeleton rows={2} />}
      {loadError && (
        <ListEmpty>
          <LoadError
            text={describeError(loadError).text}
            onRetry={() => void refetch()}
          />
        </ListEmpty>
      )}
      {data?.length === 0 && (
        <ListEmpty>{t('members.invitationsEmpty')}</ListEmpty>
      )}
      {invitations.map(invitation => (
        <InvitationRow
          key={invitation.id}
          workspace={workspace}
          invitation={invitation}
        />
      ))}
    </>
  );
}

function InvitationRow({
  workspace,
  invitation,
}: {
  readonly workspace: WorkspaceDto;
  readonly invitation: InvitationDto;
}) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const describeError = useDescribeError();
  const [revoke, { isLoading }] = useRevokeInvitationMutation();
  const [failure, setFailure] = useState<string | null>(null);
  const pending = invitation.status === INVITATION_STATUSES.pending;

  const onRevoke = async () => {
    const result = await revoke({
      workspaceId: workspace.id,
      invitationId: invitation.id,
    });
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
  };

  return (
    <ListRow
      lead={formatDate(invitation.sentAt)}
      actions={
        pending && (
          <Button
            variant='ghost'
            size='sm'
            disabled={isLoading}
            onClick={() => void onRevoke()}
          >
            {isLoading && <Spinner />}
            {t('members.revoke')}
          </Button>
        )
      }
    >
      <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
        <span
          className={
            pending
              ? 'truncate text-sm font-medium'
              : 'truncate text-sm text-muted-foreground'
          }
        >
          {invitation.email}
        </span>
        <StatusBadge status={STATUSES[invitation.status]}>
          {t(`invitationStatuses.${invitation.status}`)}
        </StatusBadge>
      </div>
      {failure && (
        <p role='alert' className='text-xs text-destructive'>
          {failure}
        </p>
      )}
    </ListRow>
  );
}
