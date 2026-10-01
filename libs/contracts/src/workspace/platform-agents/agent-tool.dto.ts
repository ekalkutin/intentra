/** A tool from the code's catalog that an Agent may be given. */
export type AgentToolDto = {
  readonly id: string;
  readonly description: string;
  /** False for a tool that writes; the code never gives those to an Agent working with a Viewer. */
  readonly readOnly: boolean;
};
