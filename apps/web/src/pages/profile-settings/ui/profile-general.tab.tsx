import { ThemeSelect } from '@/features/switch-theme';
import { UpdateAccountForm } from '@/features/update-account';
import {
  SettingsCard,
  SettingsRow,
  SettingsSection,
  SettingsTab,
} from '@/shared/ui/settings';

export const ProfileGeneralTab = () => (
  <SettingsTab title='General' description='Your account in Intentra.'>
    <SettingsSection title='Account'>
      <UpdateAccountForm />
    </SettingsSection>
    <SettingsSection
      title='Appearance'
      description='Saved in this browser only.'
    >
      <SettingsCard>
        <SettingsRow
          label='Theme'
          description='System follows your device setting.'
          size='select'
        >
          <ThemeSelect />
        </SettingsRow>
      </SettingsCard>
    </SettingsSection>
  </SettingsTab>
);
