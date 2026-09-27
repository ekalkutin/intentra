import { RenameWorkspaceForm } from '@/features/rename-workspace';
import { OpenRouterKeyForm } from '@/features/set-open-router-key';
import { SettingsSection, SettingsTab } from '@/shared/ui/settings';

export const WorkspaceGeneralTab = () => (
  <SettingsTab
    title='General'
    description='Settings every member of this workspace shares.'
  >
    <SettingsSection title='Workspace'>
      <RenameWorkspaceForm />
    </SettingsSection>
    <SettingsSection title='OpenRouter'>
      <OpenRouterKeyForm />
    </SettingsSection>
  </SettingsTab>
);
