/** In order. A new step is one more entry here. */
export const ONBOARDING_STEPS = [
  { id: 'workspace', label: 'Create workspace' },
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]['id'];
