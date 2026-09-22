import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class NotAMember extends ForbiddenException {
  constructor(message = 'Нет доступа в этот workspace') {
    super(message, { description: 'NOT_A_MEMBER' });
  }
}

export class PermissionDenied extends ForbiddenException {
  constructor(public readonly permission: string) {
    super(`Недостаточно прав: ${permission}`, {
      description: 'PERMISSION_DENIED',
    });
  }
}

/** Проекта нет либо он в другом workspace — ответ один: за границу тенанта видно не должно быть. */
export class ProjectNotFound extends NotFoundException {
  constructor(message = 'Проект не найден') {
    super(message, { description: 'PROJECT_NOT_FOUND' });
  }
}
