import { z } from 'zod';

import type { SaveSkillDto, SkillDto } from '@intentra/contracts/workspace';

/** The server's limits (the Agents domain's value objects). */
export const SKILL_LIMITS = {
  name: 64,
  description: 1024,
  instructions: 50_000,
} as const;

/** Every Skill name starts so, which keeps Intentra's own apart from any others. */
export const SKILL_NAME_PREFIX = 'intentra-';

const SKILL_NAME_PATTERN = /^intentra-[a-z0-9-]{1,55}$/;

export const skillFormSchema = z.object({
  name: z.string().trim().regex(SKILL_NAME_PATTERN),
  description: z.string().trim().min(1).max(SKILL_LIMITS.description),
  instructions: z.string().trim().min(1).max(SKILL_LIMITS.instructions),
});

export type SkillFormValues = z.infer<typeof skillFormSchema>;

export const EMPTY_SKILL: SkillFormValues = {
  name: SKILL_NAME_PREFIX,
  description: '',
  instructions: '',
};

export function skillValues(skill: SkillDto): SkillFormValues {
  return {
    name: skill.name,
    description: skill.description,
    instructions: skill.instructions,
  };
}

export function toSaveSkillDto(values: SkillFormValues): SaveSkillDto {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    instructions: values.instructions.trim(),
  };
}
