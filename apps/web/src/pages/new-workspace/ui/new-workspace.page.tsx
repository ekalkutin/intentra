import { ArrowLeft } from 'lucide-react';
import { generatePath, useNavigate } from 'react-router';

import { CreateWorkspaceForm } from '@/features/create-workspace';
import { ROUTES } from '@/shared/config';
import { Button } from '@/shared/ui/button';
import { OnboardingShell, StepHeading } from '@/widgets/onboarding-shell';

/** Onboarding's workspace step for someone who already has a workspace: it can be left. */
export const NewWorkspacePage = () => {
  const navigate = useNavigate();

  return (
    <OnboardingShell
      currentStep='workspace'
      footer={
        <Button
          variant='ghost'
          size='sm'
          className='-ml-2 w-fit shrink-0 text-muted-foreground hover:text-foreground'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
          Back
        </Button>
      }
    >
      <div className='flex flex-col gap-8'>
        <StepHeading
          title='Create a new workspace'
          description='Each workspace has its own projects, members and agents.'
        />
        <CreateWorkspaceForm
          onCreated={({ alias }) =>
            navigate(generatePath(ROUTES.WORKSPACE.ROOT, { alias }))
          }
        />
      </div>
    </OnboardingShell>
  );
};
