import { AccessPolicyService, type Member } from '../../../tenancy/index.js';
import { ProviderKeyManagementForbiddenException } from '../exceptions/index.js';

export class ProviderKeyManagementService {
  readonly #accessPolicyService = new AccessPolicyService();

  /** Only an Owner adds, replaces and removes the Provider Key. */
  public ensureCanManage(member: Member): void {
    if (!this.#accessPolicyService.canManageProviderKey(member)) {
      throw new ProviderKeyManagementForbiddenException();
    }
  }
}
