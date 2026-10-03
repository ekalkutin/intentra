import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useChangeMemberRoleMutation,
  useMembersQuery,
  useRemoveMemberMutation,
} from '@/entities/member';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Badge,
  Button,
  ConfirmDialog,
  ListEmpty,
  ListRow,
  ListSkeleton,
  LoadError,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/shared/ui';
import {
  RoleDtoSchema,
  type MemberDto,
  type RoleDto,
  type WorkspaceAccessDto,
  type WorkspaceDto,
} from '@intentra/contracts/workspace';

/** The Workspace's Members; an Owner changes Roles and removes Members here. */
export function MemberRows({
  workspace,
  access,
}: {
  readonly workspace: WorkspaceDto;
  readonly access: WorkspaceAccessDto;
}) {
  const describeError = useDescribeError();
  const {
    data: members,
    isLoading,
    error,
    refetch,
  } = useMembersQuery(workspace.id);
  const loadError = toApiError(error);

  return (
    <>
      {isLoading && <ListSkeleton />}
      {loadError && (
        <ListEmpty>
          <LoadError
            text={describeError(loadError).text}
            onRetry={() => void refetch()}
          />
        </ListEmpty>
      )}
      {members?.map(member => (
        <MemberRow
          key={member.id}
          workspace={workspace}
          access={access}
          member={member}
        />
      ))}
    </>
  );
}

function MemberRow({
  workspace,
  access,
  member,
}: {
  readonly workspace: WorkspaceDto;
  readonly access: WorkspaceAccessDto;
  readonly member: MemberDto;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const [changeRole, { isLoading: changing }] = useChangeMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [failure, setFailure] = useState<string | null>(null);
  const [removeFailure, setRemoveFailure] = useState<string | null>(null);
  const isYou = member.id === access.memberId;
  const roleLabel = (role: RoleDto | null) =>
    role ? t(`roles.${role}`) : t('roles.none');
  const items = [
    ...RoleDtoSchema.options.map(role => ({
      value: role,
      label: roleLabel(role),
    })),
    { value: null, label: roleLabel(null) },
  ];

  const onRoleChange = async (role: RoleDto | null) => {
    const result = await changeRole({
      workspaceId: workspace.id,
      memberId: member.id,
      body: { role },
    });
    const error = toApiError(result.error);
    setFailure(error ? describeError(error).text : null);
  };

  const onRemove = async () => {
    const result = await removeMember({
      workspaceId: workspace.id,
      memberId: member.id,
    });
    const error = toApiError(result.error);
    setRemoveFailure(error ? describeError(error).text : null);
    return !error;
  };

  return (
    <ListRow
      meta={access.canManageMembers ? undefined : roleLabel(member.role)}
      actions={
        access.canManageMembers && (
          <>
            {changing && <Spinner className='text-muted-foreground' />}
            <Select
              items={items}
              value={member.role}
              onValueChange={value => void onRoleChange(value)}
            >
              <SelectTrigger
                size='sm'
                className='min-w-36'
                aria-label={t('members.roleLabel', { email: member.email })}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map(item => (
                  <SelectItem key={item.label} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isYou ? (
              <span aria-hidden className='size-7' />
            ) : (
              <ConfirmDialog
                trigger={
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    aria-label={t('members.remove')}
                    title={t('members.remove')}
                  >
                    <UserMinus />
                  </Button>
                }
                title={t('members.removeTitle', { email: member.email })}
                description={t('members.removeDescription')}
                confirmLabel={t('members.removeConfirm')}
                error={removeFailure}
                onConfirm={onRemove}
              />
            )}
          </>
        )
      }
    >
      <p className='flex min-w-0 items-center gap-2 text-sm font-medium'>
        <span className='truncate'>{member.name}</span>
        {isYou && <Badge variant='secondary'>{t('common.you')}</Badge>}
      </p>
      <p className='truncate text-xs text-muted-foreground'>{member.email}</p>
      {failure && (
        <p role='alert' className='text-xs text-destructive'>
          {failure}
        </p>
      )}
    </ListRow>
  );
}
