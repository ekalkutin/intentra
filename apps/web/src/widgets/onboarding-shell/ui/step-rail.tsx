import { Check, Target } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import { DotSphere } from '@/shared/ui/dot-sphere';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
} from '@/shared/ui/stepper';

import { ONBOARDING_STEPS, type OnboardingStep } from '../model/steps';

const stepIndex = (step: OnboardingStep) =>
  Math.max(
    0,
    ONBOARDING_STEPS.findIndex(({ id }) => id === step),
  );

type StepNavProps = {
  currentStep: OnboardingStep;
  footer?: ReactNode;
};

/** Hidden below `md`, where `StepProgressBar` carries the same information. */
export const StepRail = ({ currentStep, footer }: StepNavProps) => {
  const currentIndex = stepIndex(currentStep);

  return (
    <aside className='hidden w-[19rem] shrink-0 p-3 md:block lg:w-[22rem] lg:p-4'>
      <div className='dark relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl bg-background px-5 pb-5 text-foreground ring-1 ring-border'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 bg-background'
        >
          <DotSphere
            dotGap={19}
            motion='wave'
            sphereCount={5}
            sphereRadius='20%'
            dotRadiusMax={1.9}
            speed={0.4}
          />
        </div>

        <div className='relative flex min-h-0 flex-1 flex-col pt-5'>
          <header className='flex min-h-9 shrink-0 items-center gap-2'>
            <Target aria-hidden className='size-5 shrink-0' />
            <span className='text-label font-medium'>Intentra</span>
          </header>

          <div className='flex min-h-0 flex-1 items-center justify-center py-10'>
            <Stepper
              value={currentIndex + 1}
              orientation='vertical'
              role='group'
              aria-label='Onboarding steps'
              className='flex w-full flex-col items-start justify-center gap-0'
            >
              <StepperNav className='w-full'>
                {ONBOARDING_STEPS.map(({ id, label }, index) => {
                  const isDone = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const isLast = index === ONBOARDING_STEPS.length - 1;

                  return (
                    <StepperItem
                      key={id}
                      step={index + 1}
                      completed={isDone}
                      className='relative w-full items-start not-last:flex-1'
                      {...(isCurrent
                        ? { 'aria-current': 'step' as const }
                        : {})}
                    >
                      <div
                        className={cn(
                          'flex w-full items-start gap-3 text-left',
                          !isLast && 'pb-6',
                        )}
                      >
                        <StepperIndicator
                          className={cn(
                            'mt-0.5 size-4 shrink-0 border-0 bg-transparent ring-1 transition-colors',
                            isDone
                              ? 'bg-foreground text-background ring-foreground'
                              : isCurrent
                                ? 'text-transparent ring-muted-foreground'
                                : 'text-transparent ring-border',
                          )}
                        >
                          {isDone ? (
                            <Check aria-hidden className='size-3' />
                          ) : isCurrent ? (
                            <span
                              aria-hidden
                              className='block size-1.5 rounded-full bg-foreground'
                            />
                          ) : (
                            <span className='sr-only'>{index + 1}</span>
                          )}
                        </StepperIndicator>
                        <div className='min-w-0 flex-1 text-left'>
                          <StepperTitle
                            className={cn(
                              'transition-colors',
                              isCurrent || isDone
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {label}
                          </StepperTitle>
                        </div>
                      </div>

                      {!isLast ? (
                        <StepperSeparator
                          className={cn(
                            'absolute top-6 left-2 -order-1 m-0 w-px -translate-x-1/2',
                            'group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-1.75rem)]',
                            isDone ? 'bg-muted-foreground' : 'bg-border',
                          )}
                        />
                      ) : null}
                    </StepperItem>
                  );
                })}
              </StepperNav>
            </Stepper>
          </div>

          {footer ? (
            <footer className='flex min-h-8 shrink-0 items-end justify-between gap-4'>
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

/** The rail's compact form for narrow screens. */
export const StepProgressBar = ({ currentStep, footer }: StepNavProps) => {
  const currentIndex = stepIndex(currentStep);

  return (
    <div className='mb-6 flex items-center gap-3 md:hidden'>
      <span aria-hidden className='flex flex-1 items-center gap-1.5'>
        {ONBOARDING_STEPS.map(({ id }, index) => (
          <span
            key={id}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index <= currentIndex ? 'bg-foreground' : 'bg-border',
            )}
          />
        ))}
      </span>
      <span className='min-w-0 truncate text-caption font-medium text-muted-foreground'>
        {ONBOARDING_STEPS[currentIndex]?.label}
      </span>
      {footer ? <span className='shrink-0'>{footer}</span> : null}
    </div>
  );
};
