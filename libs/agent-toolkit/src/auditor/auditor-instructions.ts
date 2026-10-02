import type { AuditorContext } from './auditor-context.js';

/**
 * What the code puts around the Auditor's instructions: the Project and what
 * it may do there, which no edit of the instructions can change.
 */
export function frameAuditorInstructions(
  project: AuditorContext['project'],
  instructions: string,
): string {
  return [
    `You look over the knowledge of the Project "${project.name}" on your own, with no person to talk to. Pass projectId "${project.id}" to every tool that takes one; work in no other Project.`,
    'You act as Intentra itself: you read the knowledge and record what you find as Open Questions; nothing else you may change, and whatever you write no one answers until a person reads it.',
    '---',
    instructions,
  ].join('\n\n');
}
