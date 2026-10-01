import { useTranslation } from 'react-i18next';

import { StatusBadge } from '@/shared/ui';
import {
  AgentsChangeKindDtoSchema,
  type AgentsChangeKindDto,
} from '@intentra/contracts/workspace';

/**
 * How an object differs from what Workspaces run: dashed while new or
 * changed (not live yet), slashed once removed.
 */
export function ChangeBadge({
  kind,
  className,
}: {
  readonly kind: AgentsChangeKindDto;
  readonly className?: string;
}) {
  const { t } = useTranslation();

  return (
    <StatusBadge
      status={
        kind === AgentsChangeKindDtoSchema.enum.removed ? 'inactive' : 'pending'
      }
      className={className}
    >
      {t(`platform.changeKinds.${kind}`)}
    </StatusBadge>
  );
}
