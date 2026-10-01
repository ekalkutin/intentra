import { LanguageSwitch } from '@/features/switch-language';
import { ThemeSwitch } from '@/features/switch-theme';

import { AccountMenu } from './account-menu';

/** The right end of every header: the language, the light or dark theme, and the account. */
export function HeaderControls({
  workspaceSlug,
}: {
  /** The Workspace the person is in, if any. */
  readonly workspaceSlug?: string;
}) {
  return (
    <div className='flex items-center gap-1'>
      <LanguageSwitch />
      <ThemeSwitch />
      <AccountMenu workspaceSlug={workspaceSlug} />
    </div>
  );
}
