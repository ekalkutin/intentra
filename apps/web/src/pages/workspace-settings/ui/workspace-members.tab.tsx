import { useQuery } from '@apollo/client/react';

import { accountInitial, accountLabel, ME_QUERY } from '@/entities/account';
import { useCurrentWorkspace } from '@/entities/workspace';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import {
  SettingsCard,
  SettingsSection,
  SettingsTab,
} from '@/shared/ui/settings';
import { Skeleton } from '@/shared/ui/skeleton';

import { WORKSPACE_MEMBERS_QUERY } from '../api/workspace-members.query';

export const WorkspaceMembersTab = () => {
  const workspace = useCurrentWorkspace();
  const { data: me } = useQuery(ME_QUERY);
  const { data, loading } = useQuery(WORKSPACE_MEMBERS_QUERY);
  const members =
    data?.workspaces.find(item => item.id === workspace.id)?.members ?? [];

  return (
    <SettingsTab
      title='Members'
      description={`People with access to ${workspace.name}.`}
    >
      <SettingsSection
        title={
          loading && !data
            ? 'Members'
            : `${members.length} ${members.length === 1 ? 'member' : 'members'}`
        }
      >
        {loading && !data ? (
          <Skeleton className='h-32 w-full rounded-xl' />
        ) : (
          <SettingsCard>
            {members.map(member => (
              <div
                key={member.id}
                className='flex min-h-16 items-center gap-3 px-4 py-3'
              >
                <Avatar>
                  <AvatarFallback>{accountInitial(member)}</AvatarFallback>
                </Avatar>
                <div className='grid min-w-0 flex-1'>
                  <span className='truncate text-body font-medium'>
                    {accountLabel(member)}
                  </span>
                  {member.displayName ? (
                    <span className='truncate text-caption text-muted-foreground'>
                      {member.email}
                    </span>
                  ) : null}
                </div>
                {member.id === me?.me.id ? (
                  <Badge variant='secondary'>You</Badge>
                ) : null}
              </div>
            ))}
          </SettingsCard>
        )}
      </SettingsSection>
    </SettingsTab>
  );
};
