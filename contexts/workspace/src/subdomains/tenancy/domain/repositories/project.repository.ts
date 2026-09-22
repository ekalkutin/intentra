import { Project } from '../entities/index.js';

export abstract class ProjectRepository {
  abstract save(project: Project): Promise<void>;
  abstract findById(id: string): Promise<Project | null>;
  /**
   * Проекты workspace, суженные до перечисленных идентификаторов.
   *
   * Отбор делает база, а не вызывающий: обрезать полный список после выборки
   * значит однажды забыть обрезать.
   */
  abstract findManyInWorkspace(
    workspaceId: string,
    onlyIds?: readonly string[],
  ): Promise<Project[]>;
}
