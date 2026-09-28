import { useQuery } from '@apollo/client/react';
import { Bot, Crown, PlusIcon } from 'lucide-react';

import {
  AGENT_PROFILES_QUERY,
  isOrchestrator,
  type AgentProfile,
} from '@/entities/agent-profile';
import { useCurrentWorkspace } from '@/entities/workspace';
import { DeleteAgentProfileButton } from '@/features/delete-agent-profile';
import { AgentProfileDialog } from '@/features/save-agent-profile';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/shared/ui/item';
import { SettingsTab } from '@/shared/ui/settings';
import { Skeleton } from '@/shared/ui/skeleton';

const AgentItem = ({ profile }: { profile: AgentProfile }) => {
  const orchestrator = isOrchestrator(profile);

  return (
    <Item variant='outline'>
      <ItemMedia variant='icon'>{orchestrator ? <Crown /> : <Bot />}</ItemMedia>
      <ItemContent>
        <ItemTitle>
          {profile.name}
          {orchestrator ? (
            <Badge variant='secondary'>Orchestrator</Badge>
          ) : null}
        </ItemTitle>
        <ItemDescription>{profile.description}</ItemDescription>
        <span className='font-mono text-xs text-muted-foreground'>
          {profile.model}
        </span>
      </ItemContent>
      <ItemActions>
        <AgentProfileDialog
          profile={profile}
          trigger={
            <Button variant='ghost' size='sm'>
              Edit
            </Button>
          }
        />
        {orchestrator ? null : <DeleteAgentProfileButton profile={profile} />}
      </ItemActions>
    </Item>
  );
};

export const WorkspaceAgentsTab = () => {
  const workspace = useCurrentWorkspace();
  const { data, loading } = useQuery(AGENT_PROFILES_QUERY, {
    variables: { workspaceId: workspace.id },
  });
  const profiles = data?.agentProfiles ?? [];

  return (
    <SettingsTab
      title='Agents'
      description='Shared by every project. The orchestrator answers in the chat and delegates to the other agents by their descriptions.'
      actions={
        <AgentProfileDialog
          trigger={
            <Button size='sm'>
              <PlusIcon data-icon='inline-start' />
              New agent
            </Button>
          }
        />
      }
    >
      {loading && !data ? (
        <Skeleton className='h-40 w-full rounded-xl' />
      ) : (
        <ItemGroup className='gap-3'>
          {profiles.map(profile => (
            <AgentItem key={profile.id} profile={profile} />
          ))}
        </ItemGroup>
      )}
    </SettingsTab>
  );
};
