import { Identity } from '../dto/access/identity.js';
import { CreateProjectDto, ProjectDto } from '../dto/project.js';

export interface ProjectsApi {
  create(dto: CreateProjectDto, identity: Identity): Promise<ProjectDto>;
  /** Проекты workspace, видимые спрашивающему: владелец видит все, участник — только выданные ему. */
  findMany(identity: Identity): Promise<ProjectDto[]>;
}
