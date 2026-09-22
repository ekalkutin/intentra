import { Injectable } from '@nestjs/common';

import { type Permission } from '../../subdomains/access/domain/value-objects/index.js';
import { PermissionDenied } from '../exceptions/index.js';

import { ActingMember } from './acting-member.js';

/**
 * Единственное место, где выносится вердикт «можно ли этому человеку это
 * действие в этой области».
 *
 * Живёт здесь, а не в шлюзе: шлюз знает только, кто спрашивает. Отказ называет
 * недостающее право — иначе разбор «почему мне нельзя» превращается в чтение
 * исходников.
 */
@Injectable()
export class AccessPolicy {
  public require(member: ActingMember, permission: Permission): void {
    if (!member.can(permission)) {
      throw new PermissionDenied(permission);
    }
  }

  public requireInProject(
    member: ActingMember,
    projectId: string,
    permission: Permission,
  ): void {
    if (!member.canInProject(projectId, permission)) {
      throw new PermissionDenied(permission);
    }
  }
}
