import { useEffect } from 'react';
import { useParams } from 'react-router';

import { ROUTE_PARAMS } from '@/shared/config';
import type {
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

import {
  useWorkspaceAccessQuery,
  useWorkspacesQuery,
} from '../api/workspace-api';

import { rememberLastWorkspaceSlug } from './last-workspace';

export type CurrentWorkspace = {
  /** Undefined while loading, and when the slug names no Workspace of the person's. */
  readonly workspace: WorkspaceDto | undefined;
  /** What the person may do in it; undefined until loaded. */
  readonly access: WorkspaceAccessDto | undefined;
  readonly workspaces: WorkspaceDto[];
  readonly isLoading: boolean;
  /** The slug in the address names no Workspace the person is in. */
  readonly isMissing: boolean;
};

/** The Workspace named in the address, remembered as the last one opened. */
export function useCurrentWorkspace(): CurrentWorkspace {
  const slug = useParams()[ROUTE_PARAMS.workspaceSlug];
  const { data: workspaces = [], isLoading } = useWorkspacesQuery();
  const workspace = workspaces.find(candidate => candidate.slug === slug);
  const { data: access, isLoading: isAccessLoading } = useWorkspaceAccessQuery(
    workspace?.id ?? '',
    { skip: !workspace },
  );

  useEffect(() => {
    if (workspace) {
      rememberLastWorkspaceSlug(workspace.slug);
    }
  }, [workspace]);

  return {
    workspace,
    access,
    workspaces,
    isLoading: isLoading || isAccessLoading,
    isMissing: !isLoading && !workspace,
  };
}
