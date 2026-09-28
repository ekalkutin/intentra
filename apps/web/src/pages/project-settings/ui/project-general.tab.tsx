import { useCurrentProject } from '@/entities/project';
import {
  SettingsCard,
  SettingsRow,
  SettingsSection,
  SettingsTab,
} from '@/shared/ui/settings';

export const ProjectGeneralTab = () => {
  const project = useCurrentProject();

  return (
    <SettingsTab title='General' description='What this project is.'>
      <SettingsSection title='Project'>
        <SettingsCard>
          <SettingsRow label='Name'>
            <span className='text-body'>{project.name}</span>
          </SettingsRow>
          <SettingsRow label='Description'>
            <span className='text-body text-muted-foreground'>
              {project.description ?? '—'}
            </span>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>
    </SettingsTab>
  );
};
