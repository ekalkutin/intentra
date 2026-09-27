import { RenameWorkspaceForm } from '@/features/rename-workspace';
import { SettingsSection, SettingsTab } from '@/shared/ui/settings';

export const WorkspaceGeneralTab = () => (
  <SettingsTab
    title='General'
    description='Settings every member of this workspace shares.'
  >
    <SettingsSection title='Workspace'>
      <RenameWorkspaceForm />
    </SettingsSection>
  </SettingsTab>
);
