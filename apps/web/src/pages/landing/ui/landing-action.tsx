import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { IntentraButton } from '@/shared/ui';

/** Marketing-sized invitation with the same mark and light pass as the product. */
export function LandingAction({
  to,
  children,
}: {
  readonly to: string;
  readonly children: ReactNode;
}) {
  return (
    <IntentraButton
      size='default'
      className='landing-cta'
      render={<Link to={to} />}
      nativeButton={false}
      role='link'
    >
      {children}
    </IntentraButton>
  );
}
