import { Injectable } from '@nestjs/common';

import type { AccountsApi } from '@intentra/contracts/iam';

@Injectable()
export class AccountsService implements AccountsApi {}
