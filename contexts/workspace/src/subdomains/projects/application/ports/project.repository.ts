import { Project } from '../../domain/entities/index.js';

export abstract class ProjectRepository {
  abstract find(): Promise<Project[]>;
  abstract save(project: Project): Promise<void>;
}
