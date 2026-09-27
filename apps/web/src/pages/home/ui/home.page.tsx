import { useQuery } from '@apollo/client/react';

import { WORKSPACES_QUERY } from '@/entities/workspace';
import { SignOutButton } from '@/features/sign-out';

export const HomePage = () => {
  const { data } = useQuery(WORKSPACES_QUERY);

  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-4'>
      <h1 className='text-title-lg font-semibold'>Your workspaces</h1>
      <ul className='flex flex-col gap-1 text-body'>
        {data?.workspaces.map(workspace => (
          <li key={workspace.id}>
            {workspace.name}{' '}
            <span className='font-mono text-muted-foreground'>
              /{workspace.alias}
            </span>
          </li>
        ))}
      </ul>
      <SignOutButton />
    </main>
  );
};
