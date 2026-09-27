import { generatePath, useNavigate } from 'react-router';

import { CreateWorkspaceForm } from '@/features/create-workspace';
import { SignOutButton } from '@/features/sign-out';
import { ROUTES } from '@/shared/config';
import { OnboardingShell, StepHeading } from '@/widgets/onboarding-shell';

export const OnboardingPage = () => {
  const navigate = useNavigate();

  return (
    <OnboardingShell
      currentStep='workspace'
      footer={<SignOutButton className='-ml-2 w-fit shrink-0' />}
    >
      <div className='flex flex-col gap-8'>
        <StepHeading
          title='Create your workspace'
          description='A workspace holds your projects, your team and your agents. You can rename it later.'
        />
        <CreateWorkspaceForm
          onCreated={({ alias }) =>
            navigate(generatePath(ROUTES.WORKSPACE.ROOT, { alias }), {
              replace: true,
            })
          }
        />
      </div>
    </OnboardingShell>
  );
};
