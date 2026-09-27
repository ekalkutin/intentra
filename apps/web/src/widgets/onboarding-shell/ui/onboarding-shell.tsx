import { useRef, type ReactNode } from 'react';

import { useScrollFade } from '@/shared/lib/hooks/use-scroll-fade';

import type { OnboardingStep } from '../model/steps';

import { StepProgressBar, StepRail } from './step-rail';

type OnboardingShellProps = {
  currentStep: OnboardingStep;
  /** Shown at the foot of the rail, or beside the progress bar on narrow screens. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Progress rail on the left, the step scrolling on the right, framed like
 * `AuthLayout`: both sit under a 3rem top strip, as multica's onboarding does.
 * The column is `min-h-full` and centres itself rather than being centred by
 * the pane: centring a scroll container clips the top of a step taller than
 * the window.
 */
export const OnboardingShell = ({
  currentStep,
  footer,
  children,
}: OnboardingShellProps) => {
  const mainRef = useRef<HTMLElement>(null);
  const fadeStyle = useScrollFade(mainRef);

  return (
    <div className='flex h-svh min-h-0 flex-col bg-background'>
      <div aria-hidden className='h-12 shrink-0' />
      <div className='flex min-h-0 flex-1'>
        <StepRail currentStep={currentStep} footer={footer} />
        <main
          ref={mainRef}
          style={fadeStyle}
          className='min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-14 lg:py-10'
        >
          <div className='mx-auto flex min-h-full w-full max-w-[28rem] flex-col justify-center'>
            <StepProgressBar currentStep={currentStep} footer={footer} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

type StepHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
};

/** `aria-live`: the shell persists across steps, so no navigation announces the new one. */
export const StepHeading = ({ title, description }: StepHeadingProps) => (
  <div className='flex flex-col gap-1.5' aria-live='polite'>
    <h1 className='text-title-lg font-semibold text-balance text-foreground'>
      {title}
    </h1>
    {description ? (
      <p className='text-body text-pretty text-muted-foreground'>
        {description}
      </p>
    ) : null}
  </div>
);
