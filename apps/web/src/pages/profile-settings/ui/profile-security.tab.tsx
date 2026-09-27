import { ChangePasswordForm } from '@/features/change-password';
import { SettingsSection, SettingsTab } from '@/shared/ui/settings';

export const ProfileSecurityTab = () => (
  <SettingsTab title='Security' description='How you sign in to Intentra.'>
    <SettingsSection
      title='Password'
      description='Devices already signed in stay signed in.'
    >
      <ChangePasswordForm />
    </SettingsSection>
  </SettingsTab>
);
