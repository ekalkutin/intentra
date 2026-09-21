import { LandingFooter } from '@/widgets/landing-footer';

import { FaqSection } from './faq-section';
import { FeaturesSection } from './features-section';
import { HeroSection } from './hero-section';
import { HowItWorksSection } from './how-it-works-section';
import { PrinciplesSection } from './principles-section';

/* The band rhythm is the macrostructure — dark, light, dark, light, quiet,
 * ink. Nothing else divides the page: no rules between sections, no container
 * boundaries. The surface change IS the section break. */
export function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PrinciplesSection />
      <FaqSection />
      <LandingFooter />
    </>
  );
}
