import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { InterviewOpening } from '@/shared/config';
import { IntentraButton } from '@/shared/ui';

/** The way into a Conversation with Intentra that has already sent its first message. */
export function DiscussWithIntentra({
  to,
  opening,
  className,
}: {
  readonly to: string;
  readonly opening: InterviewOpening;
  readonly className?: string;
}) {
  const { t } = useTranslation();

  return (
    <IntentraButton
      className={className}
      render={<Link to={to} state={opening} viewTransition />}
      nativeButton={false}
    >
      {t('knowledgeItem.discussGaps')}
    </IntentraButton>
  );
}
