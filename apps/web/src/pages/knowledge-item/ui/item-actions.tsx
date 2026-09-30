import { Check, Ellipsis, PenLine, Replace } from 'lucide-react';
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
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Spinner,
} from '@/shared/ui';
import {
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import type { ProjectSlugs } from '../model/slugs';

import { ActionDialog } from './action-dialog';

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
  const blocked = !approval || approval.blockers.length > 0;

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

  const menu = [
    isDraft && access.canReject && (
      <DropdownMenuItem
        key={DIALOGS.reject}
        onClick={() => setDialog(DIALOGS.reject)}
      >
        {t('knowledgeItem.reject')}
      </DropdownMenuItem>
    ),
    isDraft && access.canDelete && (
      <DropdownMenuItem
        key={DIALOGS.delete}
        variant='destructive'
        onClick={() => setDialog(DIALOGS.delete)}
      >
        {t('knowledgeItem.delete')}
      </DropdownMenuItem>
    ),
    isApproved && access.canRetire && (
      <DropdownMenuItem
        key={DIALOGS.retire}
        variant='destructive'
        onClick={() => setDialog(DIALOGS.retire)}
      >
        {t('knowledgeItem.retire')}
      </DropdownMenuItem>
    ),
  ].filter(Boolean);

  const dialogProps = (name: Dialog) => ({
    open: dialog === name,
    onOpenChange: (open: boolean) => setDialog(open ? name : null),
  });

  return (
    <>
      {isApproved && access.canRecordReplacement && (
        <Button
          variant='outline'
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
          nativeButton={false}
        >
          <Replace />
          {t('knowledgeItem.recordReplacement')}
        </Button>
      )}
      {isDraft && access.canEdit && (
        <Button
          variant='outline'
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
          nativeButton={false}
        >
          <PenLine />
          {t('knowledgeItem.edit')}
        </Button>
      )}
      {isDraft && access.canApprove && (
        <Button
          disabled={blocked || approving}
          onClick={() => void runApproval()}
        >
          {approving || !approval ? <Spinner /> : <Check />}
          {together > 0
            ? t('knowledgeItem.approveWith', { count: together })
            : t('knowledgeItem.approve')}
        </Button>
      )}
      {menu.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant='outline'
                size='icon'
                aria-label={t('knowledgeItem.more')}
              >
                <Ellipsis />
              </Button>
            }
          />
          <DropdownMenuContent align='end' className='min-w-60'>
            <DropdownMenuGroup>{menu}</DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
