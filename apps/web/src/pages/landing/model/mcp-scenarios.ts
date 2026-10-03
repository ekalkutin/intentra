export type TerminalLineKind =
  'prompt' | 'system' | 'call' | 'output' | 'warning' | 'answer' | 'human';

export const MCP_SCENARIOS = [
  {
    id: 'implementation',
    lines: [
      ['prompt', 'prompt'],
      ['system', 'connected'],
      ['call', 'frame'],
      ['call', 'context'],
      ['output', 'rule'],
      ['output', 'scenario'],
      ['output', 'requirement'],
      ['answer', 'answer'],
    ],
  },
  {
    id: 'gaps',
    lines: [
      ['prompt', 'prompt'],
      ['system', 'connected'],
      ['call', 'context'],
      ['warning', 'conflict'],
      ['warning', 'constraint'],
      ['call', 'gaps'],
      ['warning', 'criteria'],
      ['answer', 'answer'],
    ],
  },
  {
    id: 'approval',
    lines: [
      ['prompt', 'prompt'],
      ['system', 'connected'],
      ['call', 'check'],
      ['call', 'record'],
      ['output', 'draft'],
      ['call', 'dependencies'],
      ['output', 'version'],
      ['human', 'consent'],
      ['call', 'approve'],
      ['answer', 'answer'],
    ],
  },
  {
    id: 'nextTask',
    lines: [
      ['prompt', 'prompt'],
      ['system', 'connected'],
      ['call', 'summary'],
      ['call', 'context'],
      ['output', 'requirement'],
      ['warning', 'question'],
      ['answer', 'answer'],
      ['output', 'scope'],
    ],
  },
] as const satisfies readonly {
  id: string;
  lines: readonly (readonly [TerminalLineKind, string])[];
}[];

export const MCP_SCENARIO_HOLD = 5000;
export const isTypedLine = (kind: TerminalLineKind) =>
  kind === 'prompt' || kind === 'answer' || kind === 'human';
