import { Users } from 'lucide-react';

import { useCurrentProject } from '@/entities/project';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import { SettingsTab } from '@/shared/ui/settings';

export const ProjectMembersTab = () => {
  const project = useCurrentProject();

  return (
    <SettingsTab
      title='Members'
      description={`People with access to ${project.name} and what they may do.`}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Users />
          </EmptyMedia>
          <EmptyTitle>Everyone in the workspace</EmptyTitle>
          <EmptyDescription>
            For now every workspace member has full access to the project.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </SettingsTab>
  );
};
