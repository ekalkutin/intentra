import { Injectable } from '@nestjs/common';

import { Identity } from '@intentra/workspace-contracts';

import {
  MembershipRepository,
  RoleAssignmentRepository,
} from '../../subdomains/access/domain/repositories/index.js';
import { type Role } from '../../subdomains/access/domain/value-objects/index.js';
import { NotAMember } from '../exceptions/index.js';

import { ActingMember } from './acting-member.js';

/**
 * Превращает «кто спрашивает» в «что ему здесь выдано».
 *
 * Без кеша намеренно: выданное право должно действовать сразу, а снятое —
 * перестать действовать сразу. Это два запроса на вызов; когда они начнут
 * стоить, кеш появится вместе с признаком, по которому его сбрасывать.
 */
@Injectable()
export class AccessResolver {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly assignments: RoleAssignmentRepository,
  ) {}

  public async resolveOrNull(identity: Identity): Promise<ActingMember | null> {
    const { workspaceId, accountId, isPlatformAdmin } = identity;

    const membership = await this.memberships.findOne(workspaceId, accountId);

    /* Платформенный администратор ни в одном workspace не состоит (ADR 0003),
       поэтому отсутствие участия для него не отказ. */
    if (!membership && !isPlatformAdmin) {
      return null;
    }

    const granted = await this.assignments.findMany(workspaceId, accountId);

    const workspaceRoles: Role[] = [];
    const projectRoles = new Map<string, Role[]>();

    for (const assignment of granted) {
      if (assignment.scope.type === 'workspace') {
        workspaceRoles.push(assignment.role);
        continue;
      }

      const projectId = assignment.scope.id;

      if (projectId === null) {
        continue;
      }

      projectRoles.set(projectId, [
        ...(projectRoles.get(projectId) ?? []),
        assignment.role,
      ]);
    }

    return ActingMember.of({
      workspaceId,
      accountId,
      isPlatformAdmin,
      workspaceRoles,
      projectRoles,
    });
  }

  /** То же, но отказом вместо `null`: первая строка почти каждого use-case. */
  public async resolve(identity: Identity): Promise<ActingMember> {
    const member = await this.resolveOrNull(identity);

    if (!member) {
      throw new NotAMember();
    }

    return member;
  }
}
