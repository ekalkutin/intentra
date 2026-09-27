import { Provider } from '@nestjs/common';

import {
  CreateProjectCommand,
  CreateProjectCommandHandler,
} from './create-project/create-project.command.js';
import {
  FindManyProjectsQuery,
  FindManyProjectsQueryHandler,
} from './find-many-projects/find-many-projects.query.js';
import {
  GetOneProjectQuery,
  GetOneProjectQueryHandler,
} from './get-one-project/get-one-project.query.js';

export { CreateProjectCommand, FindManyProjectsQuery, GetOneProjectQuery };

export const PROJECTS_CQRS_HANDLERS: Provider[] = [
  CreateProjectCommandHandler,
  GetOneProjectQueryHandler,
  FindManyProjectsQueryHandler,
];
