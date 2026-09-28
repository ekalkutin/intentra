import { Injectable } from '@nestjs/common';

import type { AgentsApi } from '@intentra/contracts/agents';

@Injectable()
export class AgentsApiService implements AgentsApi {}
