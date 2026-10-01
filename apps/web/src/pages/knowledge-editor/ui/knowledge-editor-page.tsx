import { Replace } from 'lucide-react';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router';

import {
  KNOWLEDGE_ERROR_CODES,
  parseKnowledgeKind,
  useKnowledgeIndex,
  useKnowledgeItemQuery,
  useKnowledgeItemsQuery,
} from '@/entities/knowledge-item';
import { useCurrentProject } from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import {
  KNOWLEDGE_SEARCH_PARAMS,
  knowledgeItemPath,
  newKnowledgeItemPath,
  PROJECT_PAGES,
  projectPath,
  ROUTE_PARAMS,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  BackLink,
  Button,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';
import {
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import { emptyValues, valuesFrom } from '../model/editor-values';

import { EditorForm, type EditorTarget } from './editor-form';

const { draft, approved } = KnowledgeStatusDtoSchema.enum;

/**
 * Records a new Draft of a Kind (`knowledge/new?kind=…`), a replacement of an
 * Approved item (`&supersedes=REQ-12`, starting from its text), or edits a
 * Draft (`knowledge/REQ-12/edit`).
 */
export function KnowledgeEditorPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const editedKey = useParams()[ROUTE_PARAMS.knowledgeKey] ?? null;
  const [params] = useSearchParams();
  const supersedes = params.get(KNOWLEDGE_SEARCH_PARAMS.supersedes);
  const { workspace, access: workspaceAccess } = useCurrentWorkspace();
  const { project } = useCurrentProject(workspace?.id, workspaceAccess);
  const scope = {
    workspaceId: workspace?.id ?? '',
    projectId: project?.id ?? '',
  };
  const skip = !workspace || !project;
  const sourceKey = editedKey ?? supersedes;
  const source = useKnowledgeItemQuery(
    { ...scope, key: sourceKey ?? '' },
    { skip: skip || !sourceKey, refetchOnMountOrArgChange: true },
  );
  const kind: KnowledgeKindDto | null = editedKey
    ? (source.currentData?.kind ?? null)
    : parseKnowledgeKind(params.get(KNOWLEDGE_SEARCH_PARAMS.kind));
  // The list's verdict on which Kinds the person may record.
  const recordable = useKnowledgeItemsQuery(
    { ...scope, filter: { take: 1 } },
    { skip: skip || Boolean(editedKey) },
  );
  const index = useKnowledgeIndex(scope, { skip });
  const loadError = toApiError(source.error);

  if (!workspace || !project) {
    return <PageSkeleton />;
  }

  const knowledgePath = projectPath(
    workspace.slug,
    project.slug,
    PROJECT_PAGES.knowledge,
  );
  const slugs = { workspaceSlug: workspace.slug, projectSlug: project.slug };
  const itemPath = (key: string) =>
    knowledgeItemPath(workspace.slug, project.slug, key);
  const toList = { to: knowledgePath, label: t('knowledgeItem.back') };
  const toItem = (key: string) => ({
    to: itemPath(key),
    label: key,
    mono: true,
  });
  const refusal = (
    title: ReactNode,
    description: string,
    back: Back,
    action?: ReactNode,
  ) => (
    <Page>
      <BackLink {...back} />
      <PageHeader title={title} description={description} actions={action} />
    </Page>
  );
  const keyTitle = (
    i18nKey: 'knowledgeEditor.titleEdit' | 'knowledgeEditor.titleReplacement',
    key: string,
  ) => (
    <Trans
      i18nKey={i18nKey}
      values={{ key }}
      components={{ mono: <span className='font-mono' /> }}
    />
  );

  if (loadError) {
    return loadError.code === KNOWLEDGE_ERROR_CODES.notFound ? (
      refusal(
        t('knowledgeItem.missing'),
        editedKey
          ? t('knowledgeItem.missingHint')
          : t('knowledgeEditor.missingSuperseded'),
        toList,
      )
    ) : (
      <Page>
        <BackLink {...toList} />
        <LoadError
          text={describeError(loadError).text}
          onRetry={() => void source.refetch()}
        />
      </Page>
    );
  }
  if (!editedKey && !kind) {
    return refusal(
      t('knowledgeEditor.titleNew'),
      t('knowledgeEditor.unknownKind'),
      toList,
    );
  }
  const item = source.currentData;
  if ((sourceKey && !item) || (!editedKey && !recordable.data) || !kind) {
    return <PageSkeleton />;
  }

  const linkTargets = index.items
    .filter(
      candidate =>
        candidate.key !== editedKey &&
        (candidate.status === draft || candidate.status === approved),
    )
    .map(({ key, title }) => ({ key, title }));
  const kindName = t(`kindsOne.${kind}`);

  if (editedKey && item) {
    if (item.status !== draft) {
      return refusal(
        keyTitle('knowledgeEditor.titleEdit', item.key),
        t('knowledgeEditor.notDraft'),
        toItem(item.key),
        item.access.canRecordReplacement && (
          <Button
            variant='outline'
            render={
              <Link
                to={newKnowledgeItemPath(
                  workspace.slug,
                  project.slug,
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
        ),
      );
    }
    if (!item.access.canEdit) {
      return refusal(
        keyTitle('knowledgeEditor.titleEdit', item.key),
        t('knowledgeEditor.cannotEdit'),
        toItem(item.key),
      );
    }
    return (
      <EditorPage
        key={`${item.key}-${item.version}`}
        back={toItem(item.key)}
        title={keyTitle('knowledgeEditor.titleEdit', item.key)}
        description={t('knowledgeEditor.descriptionEdit', { kind: kindName })}
      >
        <EditorForm
          kind={kind}
          target={{ mode: 'edit', key: item.key, version: item.version }}
          initial={valuesFrom(item)}
          scope={scope}
          slugs={slugs}
          linkTargets={linkTargets}
          cancelTo={itemPath(item.key)}
          submitLabel={t('knowledgeEditor.submitEdit')}
        />
      </EditorPage>
    );
  }

  if (!recordable.data?.access.canRecord.includes(kind)) {
    return refusal(
      t('knowledgeEditor.titleNew'),
      t('knowledgeEditor.notRecordable'),
      toList,
    );
  }
  const replaced = replacedItem(item, kind);
  const target: EditorTarget = {
    mode: 'record',
    supersedes: replaced?.key ?? null,
  };

  return (
    <EditorPage
      key={`${kind}-${replaced?.key ?? ''}`}
      back={replaced ? toItem(replaced.key) : toList}
      title={
        replaced
          ? keyTitle('knowledgeEditor.titleReplacement', replaced.key)
          : t('knowledgeEditor.titleNew')
      }
      description={
        replaced
          ? t('knowledgeEditor.descriptionReplacement', {
              kind: kindName,
              key: replaced.key,
            })
          : t('knowledgeEditor.descriptionNew', { kind: kindName })
      }
    >
      <EditorForm
        kind={kind}
        target={target}
        initial={replaced ? valuesFrom(replaced) : emptyValues(kind)}
        scope={scope}
        slugs={slugs}
        linkTargets={linkTargets}
        cancelTo={replaced ? itemPath(replaced.key) : knowledgePath}
        submitLabel={t('knowledgeEditor.submitNew')}
      />
    </EditorPage>
  );
}

/** The item a new Draft replaces: an Approved one of the same Kind, else none. */
function replacedItem(
  item: KnowledgeItemDto | undefined,
  kind: KnowledgeKindDto,
): KnowledgeItemDto | null {
  return item && item.kind === kind && item.status === approved ? item : null;
}

/** Where the page leads back to: the item it works on, or the list. */
type Back = {
  readonly to: string;
  readonly label: string;
  /** The label is a Knowledge Key. */
  readonly mono?: boolean;
};

function EditorPage({
  back,
  title,
  description,
  children,
}: {
  readonly back: Back;
  readonly title: ReactNode;
  readonly description: string;
  readonly children: ReactNode;
}) {
  return (
    <Page className='pb-0'>
      <BackLink {...back} />
      <PageHeader title={title} description={description} />
      {children}
    </Page>
  );
}
