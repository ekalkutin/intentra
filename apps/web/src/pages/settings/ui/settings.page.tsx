import { useCurrentWorkspace } from '@/entities/workspace';
import { PageHeader } from '@/widgets/app-shell';

export const SettingsPage = () => {
  const workspace = useCurrentWorkspace();

  return (
    <>
      <PageHeader title='Settings' />
      <div className='flex flex-col gap-1 p-6'>
        <p className='text-body font-medium'>{workspace.name}</p>
        <p className='font-mono text-caption text-muted-foreground'>
          {window.location.host}/{workspace.alias}
        </p>
      </div>
    </>
  );
};
