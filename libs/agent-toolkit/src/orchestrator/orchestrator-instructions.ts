import {
  ProjectRoleDtoSchema,
  type ProjectRoleDto,
} from '@intentra/contracts/workspace';

import type { OrchestratorContext } from './orchestrator-context.js';

const ROLE_RULES: Record<ProjectRoleDto, string> = {
  viewer:
    'They are a Viewer: answer their questions from what is known, but record, edit and delete nothing, whatever the instructions below say. If they want something recorded, tell them a Contributor or Maintainer of the Project can do it.',
  contributor:
    'They are a Contributor: you may record, edit and delete Drafts with them.',
  maintainer:
    'They are a Maintainer: you may record, edit and delete Drafts with them; approving stays theirs, in Intentra, never yours.',
};

/**
 * What the code puts around an Agent's instructions: the Project and the
 * rules of the Member's Project Role. They depend on rights, so no edit of
 * the instructions can change them.
 */
export function frameInstructions(
  project: OrchestratorContext['project'],
  instructions: string,
): string {
  const recordsNothing = project.role === ProjectRoleDtoSchema.enum.viewer;

  return [
    `You talk with one Member of the Project "${project.name}". Pass projectId "${project.id}" to every tool that takes one; work in no other Project.`,
    ROLE_RULES[project.role],
    ...(recordsNothing
      ? [
          'Answer questions about the Project from its Approved knowledge (get_knowledge_summary for what is known of each Kind, list_knowledge, get_knowledge_item), and say when something is only a Draft or not known yet.',
        ]
      : []),
    '---',
    instructions,
  ].join('\n\n');
}
