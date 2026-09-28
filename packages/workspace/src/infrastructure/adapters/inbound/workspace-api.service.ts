import { Injectable } from '@nestjs/common';

import type { WorkspaceApi } from '@intentra/contracts/workspace';

@Injectable()
export class WorkspaceApiService implements WorkspaceApi {}
