import { Archive, Check, PenLine, Replace, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import {
  useApproveKnowledgeItemsMutation,
  useDeleteKnowledgeItemMutation,
  useRejectKnowledgeItemMutation,
  useRetireKnowledgeItemMutation,
  type Approval,
  type InProject,
} from '@/entities/knowledge-item';
import { toApiError, type ApiError } from '@/shared/api';
import {
  knowledgeItemPath,
  newKnowledgeItemPath,
  PROJECT_PAGES,
  projectPath,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import { Spinner } from '@/shared/ui';
import {
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import type { ProjectSlugs } from '../model/slugs';

import { ActionDialog } from './action-dialog';
import { IconAction } from './icon-action';

const DIALOGS = {
  reject: 'reject',
  delete: 'delete',
  retire: 'retire',
} as const;

type Dialog = (typeof DIALOGS)[keyof typeof DIALOGS];

/**
 * What the person may do with the item now, as the server's verdict allows:
 * approve a Draft (with the Drafts it depends on), edit, reject or delete
 * it; record a replacement of an Approved item, or retire it.
 */
export function ItemActions({
  item,
  scope,
  slugs,
  approval,
  onFailure,
  refresh,
}: {
  readonly item: KnowledgeItemDto;
  readonly scope: InProject;
  readonly slugs: ProjectSlugs;
  /** Undefined while the cascade loads. */
  readonly approval: Approval | undefined;
  /** Shows a failure that happened outside a dialog; null clears it. */
  readonly onFailure: (error: ApiError | null) => void;
  /** Reads the item again, as a failed change may mean it changed meanwhile. */
  readonly refresh: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const describeError = useDescribeError();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [approve, { isLoading: approving }] =
    useApproveKnowledgeItemsMutation();
  const [reject] = useRejectKnowledgeItemMutation();
  const [remove] = useDeleteKnowledgeItemMutation();
  const [retire] = useRetireKnowledgeItemMutation();
  const { access } = item;
  const isDraft = item.status === KnowledgeStatusDtoSchema.enum.draft;
  const isApproved = item.status === KnowledgeStatusDtoSchema.enum.approved;
  const target = { ...scope, key: item.key };
  const together = approval ? approval.items.length - 1 : 0;
  // Something in the cascade stops it: the notices above say what and how to fix it, so the action is not offered until then.
  const blocked = approval !== undefined && approval.blockers.length > 0;

  /** The failure's text for a dialog, or null once done. */
  const outcome = (error: ApiError | null): string | null => {
    if (!error) {
      return null;
    }
    refresh();
    return describeError(error).text;
  };

  const runApproval = async () => {
    if (!approval) {
      return;
    }
    onFailure(null);
    const result = await approve({ ...scope, body: { items: approval.items } });
    onFailure(toApiError(result.error));
  };

  const dialogProps = (name: Dialog) => ({
    open: dialog === name,
    onOpenChange: (open: boolean) => setDialog(open ? name : null),
  });

  return (
    <>
      {isApproved && access.canRecordReplacement && (
        <IconAction
          label={t('knowledgeItem.recordReplacement')}
          render={
            <Link
              to={newKnowledgeItemPath(
                slugs.workspaceSlug,
                slugs.projectSlug,
                item.kind,
                item.key,
              )}
            />
          }
        >
          <Replace />
        </IconAction>
      )}
      {isApproved && access.canRetire && (
        <IconAction
          label={t('knowledgeItem.retire')}
          onClick={() => setDialog(DIALOGS.retire)}
          className='hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15'
        >
          <Archive />
        </IconAction>
      )}
      {isDraft && access.canEdit && (
        <IconAction
          label={t('knowledgeItem.edit')}
          render={
            <Link
              to={knowledgeItemPath(
                slugs.workspaceSlug,
                slugs.projectSlug,
                item.key,
                { edit: true },
              )}
            />
          }
        >
          <PenLine />
        </IconAction>
      )}
      {isDraft && access.canDelete && (
        <IconAction
          label={t('knowledgeItem.delete')}
          onClick={() => setDialog(DIALOGS.delete)}
          className='hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15'
        >
          <Trash2 />
        </IconAction>
      )}
      {isDraft && (access.canReject || access.canApprove) && (
        // The decision stands apart from what only changes the item.
        <span aria-hidden className='mx-1 h-5 w-px bg-border' />
      )}
      {isDraft && access.canReject && (
        <IconAction
          label={t('knowledgeItem.reject')}
          onClick={() => setDialog(DIALOGS.reject)}
          className='hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15'
        >
          <X />
        </IconAction>
      )}
      {isDraft && access.canApprove && !blocked && (
        // The decision, as the one action in the success ink; the Drafts it takes along counted on it.
        <IconAction
          label={
            together > 0
              ? t('knowledgeItem.approveWith', { count: together })
              : t('knowledgeItem.approve')
          }
          disabled={!approval || approving}
          onClick={() => void runApproval()}
          className='relative border-success/40 bg-success/10 text-success shadow-[0_1px_2px_oklch(0.56_0.14_155/0.15)] hover:border-success/60 hover:bg-success/18 hover:text-success disabled:opacity-60 dark:border-success/35 dark:bg-success/12 dark:hover:bg-success/20'
        >
          {approving || !approval ? (
            <Spinner />
          ) : (
            <Check className='size-4.5' />
          )}
          {together > 0 && (
            <span
              aria-hidden
              className='absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-success px-1 text-[0.625rem] leading-none font-semibold text-background tabular-nums'
            >
              +{together}
            </span>
          )}
        </IconAction>
      )}
      <ActionDialog
        {...dialogProps(DIALOGS.reject)}
        title={
          <Trans
            i18nKey='knowledgeItem.rejectTitle'
            values={{ key: item.key }}
            components={{ mono: <span className='font-mono' /> }}
          />
        }
        description={t('knowledgeItem.rejectDescription')}
        confirmLabel={t('knowledgeItem.reject')}
        withReason
        onConfirm={async reason => {
          const result = await reject({
            ...target,
            body: { version: item.version, reason },
          });
          return outcome(toApiError(result.error));
        }}
      />
      <ActionDialog
        {...dialogProps(DIALOGS.delete)}
        title={
          <Trans
            i18nKey='knowledgeItem.deleteTitle'
            values={{ key: item.key }}
            components={{ mono: <span className='font-mono' /> }}
          />
        }
        description={t('knowledgeItem.deleteDescription')}
        confirmLabel={t('knowledgeItem.deleteConfirm')}
        withReason={false}
        onConfirm={async () => {
          const result = await remove({
            ...target,
            body: { version: item.version },
          });
          const failure = outcome(toApiError(result.error));
          if (!failure) {
            void navigate(
              projectPath(
                slugs.workspaceSlug,
                slugs.projectSlug,
                PROJECT_PAGES.knowledge,
              ),
              { replace: true },
            );
          }
          return failure;
        }}
      />
      <ActionDialog
        {...dialogProps(DIALOGS.retire)}
        title={
          <Trans
            i18nKey='knowledgeItem.retireTitle'
            values={{ key: item.key }}
            components={{ mono: <span className='font-mono' /> }}
          />
        }
        description={t('knowledgeItem.retireDescription')}
        confirmLabel={t('knowledgeItem.retireConfirm')}
        withReason
        onConfirm={async reason => {
          const result = await retire({
            ...target,
            body: { version: item.version, reason },
          });
          return outcome(toApiError(result.error));
        }}
      />
    </>
  );
}
