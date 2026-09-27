import { Project } from '../../domain/project/project.aggregate.js';

export abstract class ProjectRepository {
  abstract find(): Promise<Project[]>;
  abstract save(project: Project): Promise<void>;
}
