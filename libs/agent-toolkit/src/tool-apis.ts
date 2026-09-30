import type {
  AccessApi,
  KnowledgeApi,
  ProjectsApi,
} from '@intentra/contracts/workspace';

/**
 * The published sub-APIs tools read from and write to, passed in Mastra's
 * `requestContext` by whoever runs the tools. Only the ones tools use, never
 * the whole `WorkspaceApi`: Intentra's own Agents, which run the tools, are
 * part of it themselves.
 */
export type ToolApis = {
  readonly knowledge: KnowledgeApi;
  readonly projects: ProjectsApi;
  readonly access: AccessApi;
};
