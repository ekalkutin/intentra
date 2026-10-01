import { z } from 'zod';

import type {
  ModelProfileDto,
  ReasoningEffortDto,
  SaveModelProfileDto,
} from '@intentra/contracts/workspace';

/** The server's limits (the Agents domain's value objects). */
export const MODEL_PROFILE_LIMITS = {
  name: 64,
  modelId: 200,
  temperatureMax: 2,
  maxOutputTokens: 1_000_000,
} as const;

/** A Mastra model router id on OpenRouter, as the server takes it. */
export const MODEL_ID_PATTERN = /^openrouter\/[a-z0-9._-]+\/[A-Za-z0-9._:-]+$/;

/** An empty number field means the model's default. */
const isBlank = (value: string) => value.trim() === '';

/** The form keeps numbers as typed; an empty one is the model's default. */
export const modelProfileFormSchema = z.object({
  name: z.string().trim().min(1).max(MODEL_PROFILE_LIMITS.name),
  modelId: z
    .string()
    .trim()
    .max(MODEL_PROFILE_LIMITS.modelId)
    .regex(MODEL_ID_PATTERN),
  temperature: z.string().refine(value => {
    if (isBlank(value)) {
      return true;
    }
    const number = Number(value);
    return (
      Number.isFinite(number) &&
      number >= 0 &&
      number <= MODEL_PROFILE_LIMITS.temperatureMax
    );
  }),
  reasoningEffort: z.string(),
  maxOutputTokens: z.string().refine(value => {
    if (isBlank(value)) {
      return true;
    }
    const number = Number(value);
    return (
      Number.isInteger(number) &&
      number >= 1 &&
      number <= MODEL_PROFILE_LIMITS.maxOutputTokens
    );
  }),
});

export type ModelProfileFormValues = z.infer<typeof modelProfileFormSchema>;

export const EMPTY_MODEL_PROFILE: ModelProfileFormValues = {
  name: '',
  modelId: '',
  temperature: '',
  reasoningEffort: '',
  maxOutputTokens: '',
};

export function modelProfileValues(
  profile: ModelProfileDto,
): ModelProfileFormValues {
  return {
    name: profile.name,
    modelId: profile.modelId,
    temperature:
      profile.temperature === null ? '' : String(profile.temperature),
    reasoningEffort: profile.reasoningEffort ?? '',
    maxOutputTokens:
      profile.maxOutputTokens === null ? '' : String(profile.maxOutputTokens),
  };
}

export function toSaveModelProfileDto(
  values: ModelProfileFormValues,
): SaveModelProfileDto {
  return {
    name: values.name.trim(),
    modelId: values.modelId.trim(),
    temperature: isBlank(values.temperature)
      ? null
      : Number(values.temperature),
    reasoningEffort:
      values.reasoningEffort === ''
        ? null
        : (values.reasoningEffort as ReasoningEffortDto),
    maxOutputTokens: isBlank(values.maxOutputTokens)
      ? null
      : Number(values.maxOutputTokens),
  };
}
