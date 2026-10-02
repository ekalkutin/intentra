import {
  CircleAlert,
  CircleCheck,
  CircleSlash,
  CircleX,
  Info,
  TriangleAlert,
} from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  APPROVAL_BLOCKS,
  approvalBlockOf,
  KnowledgeKeyLink,
  useKnowledgeItemQuery,
  useKnowledgeScope,
  type Approval,
} from '@/entities/knowledge-item';
import { Button, Notice, Spinner } from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

const { approved, rejected, obsolete, draft } = KnowledgeStatusDtoSchema.enum;

/** What became of an item a marked one rests on; `changed` while it is still loading. */
const CAUSE_OUTCOMES = {
  superseded: 'superseded',
  retired: 'retired',
  rejected: 'rejected',
  changed: 'changed',
} as const;

/**
 * What a reader must know before trusting the item: it needs review, what
 * stops a Draft from being approved and how to fix it, it replaces or was
 * replaced by another, why it was rejected or retired, whether an Open
 * Question is answered. Each notice carries its own action, at the top of the
 * page beside the item's actions.
 */
export function ItemNotices({
  item,
  approval,
  editPath,
  confirming,
  onConfirm,
}: {
  readonly item: KnowledgeItemDto;
  readonly approval: Approval | undefined;
  /** Where the Draft is edited, when the person may. */
  readonly editPath: string | undefined;
  readonly confirming: boolean;
  readonly onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const notices: ReactNode[] = [];

  if (item.needsReview) {
    notices.push(
      <Notice
        key='review'
        icon={<TriangleAlert className='text-warning' />}
        title={t('knowledgeItem.needsReviewTitle')}
        action={
          item.access.canConfirm && (
            <Button
              variant='outline'
              size='sm'
              disabled={confirming}
              onClick={onConfirm}
            >
              {confirming && <Spinner />}
              {t('knowledgeItem.confirm')}
            </Button>
          )
        }
      >
        <ul className='flex flex-col gap-1.5'>
          {item.reviewCauses.map(cause => (
            <ReviewCause key={cause} causeKey={cause} />
          ))}
          <li>
            {item.status === draft
              ? t('knowledgeItem.reviewOtherwiseDraft')
              : t('knowledgeItem.reviewOtherwiseApproved')}
          </li>
        </ul>
      </Notice>,
    );
  } else if (item.dependencyNeedsReview) {
    notices.push(
      <Notice
        key='dependency-review'
        icon={<TriangleAlert className='text-warning' />}
      >
        {t('knowledgeItem.dependencyNeedsReview')}
      </Notice>,
    );
  }
  // The item's own mark, and what caused it, are said above with their one fix (confirming moves the Links); here only what else in the chain stops it.
  const blockers =
    item.status === draft && item.access.canApprove && approval
      ? approval.blockers.flatMap(blocker => {
          const block = approvalBlockOf(blocker);
          return blocker.key !== item.key &&
            !item.reviewCauses.includes(blocker.key) &&
            block
            ? [{ key: blocker.key, block }]
            : [];
        })
      : [];
  if (blockers.length > 0) {
    // Re-linking is done by editing the Draft.
    const fixedByEditing = blockers.some(
      ({ block }) =>
        block === APPROVAL_BLOCKS.obsolete ||
        block === APPROVAL_BLOCKS.rejected,
    );
    notices.push(
      <Notice
        key='blocked'
        icon={<CircleAlert className='text-destructive' />}
        title={t('knowledgeItem.approveBlockedTitle')}
        action={
          fixedByEditing &&
          editPath && (
            <Button
              variant='outline'
              size='sm'
              nativeButton={false}
              render={<Link to={editPath} />}
            >
              {t('knowledgeItem.edit')}
            </Button>
          )
        }
      >
        <ul className='flex flex-col gap-1.5'>
          {blockers.map(({ key, block }) => (
            <li key={key}>
              <Trans
                i18nKey={`knowledgeItem.approveBlockedBy.${block}`}
                components={{ key: <KnowledgeKeyLink itemKey={key} /> }}
              />
            </li>
          ))}
        </ul>
      </Notice>,
    );
  }
  if (item.status === draft && item.supersedes) {
    notices.push(
      <Notice key='supersedes' icon={<Info />}>
        <Trans
          i18nKey='knowledgeItem.supersedes'
          components={{
            key: <KnowledgeKeyLink itemKey={item.supersedes} />,
          }}
        />
      </Notice>,
    );
  }
  if (item.status === obsolete && item.supersededByKey) {
    notices.push(
      <Notice key='superseded' icon={<CircleSlash />}>
        <Trans
          i18nKey='knowledgeItem.supersededBy'
          components={{
            key: <KnowledgeKeyLink itemKey={item.supersededByKey} />,
          }}
        />
      </Notice>,
    );
  }
  if (item.status === obsolete && item.retiredAt) {
    notices.push(
      <Notice key='retired' icon={<CircleSlash />}>
        <span className='whitespace-pre-line'>
          {item.retirementReason
            ? t('knowledgeItem.retiredBecause', {
                reason: item.retirementReason,
              })
            : t('knowledgeItem.retiredNoReason')}
        </span>
      </Notice>,
    );
  }
  if (item.status === rejected) {
    notices.push(
      <Notice key='rejected' icon={<CircleX className='text-destructive' />}>
        <span className='whitespace-pre-line'>
          {item.rejectionReason
            ? t('knowledgeItem.rejectedBecause', {
                reason: item.rejectionReason,
              })
            : t('knowledgeItem.rejectedNoReason')}
        </span>
      </Notice>,
    );
  }
  if (
    item.kind === KnowledgeKindDtoSchema.enum['open-question'] &&
    item.status === approved
  ) {
    notices.push(
      <Notice
        key='answer'
        icon={
          item.answeredBy.length > 0 ? (
            <CircleCheck className='text-success' />
          ) : (
            <Info />
          )
        }
      >
        {item.answeredBy.length > 0 ? (
          <Trans
            i18nKey='knowledgeItem.answeredBy'
            components={{
              keys: <KeyLinks keys={item.answeredBy} />,
            }}
          />
        ) : (
          t('knowledgeItem.stillOpen')
        )}
      </Notice>,
    );
  }

  return notices.length > 0 ? (
    <div className='flex flex-col gap-3'>{notices}</div>
  ) : null;
}

/**
 * What became of one item the marked item rests on, and so what confirming
 * does to the Link: it moves onto the replacement, or goes away.
 */
function ReviewCause({ causeKey }: { readonly causeKey: string }) {
  const scope = useKnowledgeScope();
  const { data: cause } = useKnowledgeItemQuery({
    workspaceId: scope.workspaceId,
    projectId: scope.projectId,
    key: causeKey,
  });
  const next = cause?.supersededByKey;
  const outcome =
    cause?.status === obsolete
      ? next
        ? CAUSE_OUTCOMES.superseded
        : CAUSE_OUTCOMES.retired
      : cause?.status === rejected
        ? CAUSE_OUTCOMES.rejected
        : CAUSE_OUTCOMES.changed;

  return (
    <li>
      <Trans
        i18nKey={`knowledgeItem.reviewCause.${outcome}`}
        components={{
          key: <KnowledgeKeyLink itemKey={causeKey} />,
          next: next ? <KnowledgeKeyLink itemKey={next} /> : <span />,
        }}
      />
    </li>
  );
}

/** Knowledge Keys that open their items, separated by commas. */
function KeyLinks({ keys }: { readonly keys: readonly string[] }) {
  return keys.map((key, index) => (
    <Fragment key={key}>
      {index > 0 && ', '}
      <KnowledgeKeyLink itemKey={key} />
    </Fragment>
  ));
}
