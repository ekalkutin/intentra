import { NotFoundException } from '@intentra/shared-kernel';

export class SkillNotFoundException extends NotFoundException<'SKILL_NOT_FOUND'> {
  constructor() {
    super('Skill not found', 'SKILL_NOT_FOUND');
  }
}
