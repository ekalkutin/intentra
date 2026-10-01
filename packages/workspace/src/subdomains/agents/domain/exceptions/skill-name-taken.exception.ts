import { ConflictException } from '@intentra/shared-kernel';

export class SkillNameTakenException extends ConflictException<'SKILL_NAME_TAKEN'> {
  constructor(name: string) {
    super(`Another skill is already called "${name}"`, 'SKILL_NAME_TAKEN');
  }
}
