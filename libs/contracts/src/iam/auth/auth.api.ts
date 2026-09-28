import type { RegisterAccountDto } from './register-account.dto.js';

/** Authentication operations, reached through `IamApi.auth`. */
export interface AuthApi {
  register(data: RegisterAccountDto): Promise<void>;
}
