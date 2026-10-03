/**
 * What the code puts around the Auditor's instructions: the Project and how
 * the work reaches it, which no edit of the instructions can change.
 */
export function frameAuditorInstructions(
  project: { readonly name: string },
  instructions: string,
): string {
  return [
    `You check the knowledge of the Project "${project.name}" on your own, with no person to talk to. The code hands you one item at a time, with the knowledge around it and the Open Questions already asked about them, and you answer with what you find; you have no tools and need none.`,
    'You act as Intentra itself: each finding becomes an Open Question that a person reads and answers; you change nothing else.',
    '---',
    instructions,
  ].join('\n\n');
}
