import { WorkspaceApi } from '@intentra/workspace-contracts';

/**
 * Опубликованный API контекста изнутри. Абстрактный класс, а не интерфейс: он
 * же и токен внедрения, поэтому композиционный корень связывает его с
 * `WorkspaceClientPort`, ничего не зная о реализации.
 */
export abstract class WorkspaceApiPort implements WorkspaceApi {
  abstract readonly workspaces: WorkspaceApi['workspaces'];
  abstract readonly projects: WorkspaceApi['projects'];
}
