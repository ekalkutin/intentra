import {
  CircleCheck,
  CircleSlash,
  CircleX,
  Info,
  TriangleAlert,
} from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { KnowledgeKeyLink } from '@/entities/knowledge-item';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Button,
  Spinner,
} from '@/shared/ui';
import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

const { approved, rejected, obsolete, draft } = KnowledgeStatusDtoSchema.enum;

/**
 * What a reader must know before trusting the item: it needs review, it
 * replaces or was replaced by another, why it was rejected or retired,
 * whether an Open Question is answered.
 */
export function ItemNotices({
  item,
  confirming,
  onConfirm,
}: {
  readonly item: KnowledgeItemDto;
  readonly confirming: boolean;
  readonly onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const notices: ReactNode[] = [];

  if (item.needsReview) {
    notices.push(
      <Alert key='review'>
        <TriangleAlert className='text-warning!' />
        <AlertTitle>{t('knowledgeItem.needsReviewTitle')}</AlertTitle>
        <AlertDescription>
          <Trans
            i18nKey='knowledgeItem.needsReview'
            components={{
              keys: <KeyLinks keys={item.reviewCauses} />,
            }}
          />
        </AlertDescription>
        {item.access.canConfirm && (
          <AlertAction>
            <Button
              variant='outline'
              size='sm'
              disabled={confirming}
              onClick={onConfirm}
            >
              {confirming && <Spinner />}
              {t('knowledgeItem.confirm')}
            </Button>
          </AlertAction>
        )}
      </Alert>,
    );
  } else if (item.dependencyNeedsReview) {
    notices.push(
      <Alert key='dependency-review'>
        <TriangleAlert className='text-warning!' />
        <AlertDescription>
          {t('knowledgeItem.dependencyNeedsReview')}
        </AlertDescription>
      </Alert>,
    );
  }
  if (item.status === draft && item.supersedes) {
    notices.push(
      <Alert key='supersedes'>
        <Info />
        <AlertDescription>
          <Trans
            i18nKey='knowledgeItem.supersedes'
            components={{
              key: <KnowledgeKeyLink itemKey={item.supersedes} />,
            }}
          />
        </AlertDescription>
      </Alert>,
    );
  }
  if (item.status === obsolete && item.supersededByKey) {
    notices.push(
      <Alert key='superseded'>
        <CircleSlash />
        <AlertDescription>
          <Trans
            i18nKey='knowledgeItem.supersededBy'
            components={{
              key: <KnowledgeKeyLink itemKey={item.supersededByKey} />,
            }}
          />
        </AlertDescription>
      </Alert>,
    );
  }
  if (item.status === obsolete && item.retiredAt) {
    notices.push(
      <Alert key='retired'>
        <CircleSlash />
        <AlertDescription className='whitespace-pre-line'>
          {item.retirementReason
            ? t('knowledgeItem.retiredBecause', {
                reason: item.retirementReason,
              })
            : t('knowledgeItem.retiredNoReason')}
        </AlertDescription>
      </Alert>,
    );
  }
  if (item.status === rejected) {
    notices.push(
      <Alert key='rejected'>
        <CircleX className='text-destructive!' />
        <AlertDescription className='whitespace-pre-line'>
          {item.rejectionReason
            ? t('knowledgeItem.rejectedBecause', {
                reason: item.rejectionReason,
              })
            : t('knowledgeItem.rejectedNoReason')}
        </AlertDescription>
      </Alert>,
    );
  }
  if (
    item.kind === KnowledgeKindDtoSchema.enum['open-question'] &&
    item.status === approved
  ) {
    notices.push(
      <Alert key='answer'>
        {item.answeredBy.length > 0 ? (
          <CircleCheck className='text-success!' />
        ) : (
          <Info />
        )}
        <AlertDescription>
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
        </AlertDescription>
      </Alert>,
    );
  }

  return notices.length > 0 ? (
    <div className='flex flex-col gap-3'>{notices}</div>
  ) : null;
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
