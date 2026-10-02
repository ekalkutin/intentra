import {
  getToolOrDynamicToolName,
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  type UIMessage,
} from 'ai';

import {
  ChoicesDtoSchema,
  KnowledgeKindDtoSchema,
  type ChoicesDto,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

type Part = UIMessage['parts'][number];
export type ToolPart = Extract<Part, { toolCallId: string }>;

/** The tool that offers the Member answers as cards. */
const CHOICES_TOOL = 'offer_choices';
/** A Specialist is shown to Intentra as a tool named so. */
const SPECIALIST_PREFIX = 'agent-';
/** Tools that change the Project's knowledge. */
const WRITE_TOOL = /^(record|edit|confirm|delete)_/;
const READ_TOOL = /^(get|list)_/;

export const ACTIVITIES = {
  thinking: 'thinking',
  reasoning: 'reasoning',
  reading: 'reading',
  writing: 'writing',
  specialist: 'specialist',
  answering: 'answering',
} as const;

export type Activity = (typeof ACTIVITIES)[keyof typeof ACTIVITIES];

export const WRITE_ACTIONS = {
  record: 'record',
  edit: 'edit',
  confirm: 'confirm',
  delete: 'delete',
} as const;

export type WriteAction = (typeof WRITE_ACTIONS)[keyof typeof WRITE_ACTIONS];

/** A Knowledge Item a write touched, as the tool gave it back. */
export type TouchedItem = {
  readonly key: string;
  readonly kind: KnowledgeKindDto | null;
  readonly title: string | null;
};

/** What the Member sees of an agent's message, in its order. */
export type Block =
  | { readonly type: 'text'; readonly id: string; readonly text: string }
  | {
      readonly type: 'choices';
      readonly id: string;
      readonly choices: ChoicesDto;
    }
  | {
      readonly type: 'write';
      readonly id: string;
      readonly action: WriteAction;
      readonly item: TouchedItem | null;
      /** The error the tool failed with; null when it worked. */
      readonly error: string | null;
    };

/** A step of the work, kept out of the text: reasoning, a read, a Specialist, a write. */
export type Step = {
  readonly id: string;
  readonly activity: Activity;
  /** A tool's name, a Specialist's key; null for reasoning. */
  readonly name: string | null;
  /** The reasoning itself, for reasoning. */
  readonly text: string | null;
  readonly running: boolean;
  readonly failed: boolean;
};

export function toolNameOf(part: ToolPart): string {
  return getToolOrDynamicToolName(part);
}

function isRunning(part: ToolPart): boolean {
  return part.state === 'input-streaming' || part.state === 'input-available';
}

function activityOf(name: string): Activity {
  if (name.startsWith(SPECIALIST_PREFIX)) {
    return ACTIVITIES.specialist;
  }
  if (WRITE_TOOL.test(name)) {
    return ACTIVITIES.writing;
  }
  if (READ_TOOL.test(name)) {
    return ACTIVITIES.reading;
  }
  return ACTIVITIES.thinking;
}

/** A Specialist's key as the tool names it, such as `researcher`. */
export function specialistOf(name: string): string | null {
  return name.startsWith(SPECIALIST_PREFIX)
    ? name.slice(SPECIALIST_PREFIX.length)
    : null;
}

function writeActionOf(name: string): WriteAction {
  const verb = name.slice(0, name.indexOf('_'));
  return verb in WRITE_ACTIONS ? (verb as WriteAction) : WRITE_ACTIONS.record;
}

/** The item a write returned or named; models send what they send, so nothing is trusted blindly. */
export function touchedItem(part: ToolPart): TouchedItem | null {
  const output =
    part.state === 'output-available' && typeof part.output === 'object'
      ? (part.output as Record<string, unknown> | null)
      : null;
  const input =
    typeof part.input === 'object'
      ? (part.input as Record<string, unknown> | null)
      : null;
  const key = output?.key ?? input?.key;
  if (typeof key !== 'string' || key === '') {
    return null;
  }
  const kind = KnowledgeKindDtoSchema.safeParse(output?.kind);

  return {
    key,
    kind: kind.success ? kind.data : null,
    title: typeof output?.title === 'string' ? output.title : null,
  };
}

/** The cards a call offers, when its input is whole and valid. */
export function choicesOf(part: ToolPart): ChoicesDto | null {
  if (part.state === 'input-streaming') {
    return null;
  }
  const parsed = ChoicesDtoSchema.safeParse(part.input);
  return parsed.success ? parsed.data : null;
}

/**
 * Splits an agent's message into what is shown in it (text, choice cards,
 * finished writes) and the steps of its work, kept for the work log.
 */
export function readMessage(message: UIMessage): {
  readonly blocks: readonly Block[];
  readonly steps: readonly Step[];
} {
  const blocks: Block[] = [];
  const steps: Step[] = [];

  message.parts.forEach((part, index) => {
    const id = `${message.id}-${index}`;
    if (isTextUIPart(part)) {
      if (part.text.trim() !== '') {
        blocks.push({ type: 'text', id, text: part.text });
      }
      return;
    }
    if (isReasoningUIPart(part)) {
      if (part.text.trim() !== '') {
        steps.push({
          id,
          activity: ACTIVITIES.reasoning,
          name: null,
          text: part.text,
          running: part.state === 'streaming',
          failed: false,
        });
      }
      return;
    }
    if (!isToolUIPart(part)) {
      return;
    }
    const name = toolNameOf(part);
    if (name === CHOICES_TOOL) {
      const choices = choicesOf(part);
      if (choices) {
        blocks.push({ type: 'choices', id, choices });
      }
      return;
    }
    const activity = activityOf(name);
    const running = isRunning(part);
    const failed = part.state === 'output-error';
    steps.push({ id, activity, name, text: null, running, failed });
    if (activity === ACTIVITIES.writing && !running) {
      blocks.push({
        type: 'write',
        id,
        action: writeActionOf(name),
        item: touchedItem(part),
        error: failed ? (part.errorText ?? '') : null,
      });
    }
  });

  return { blocks, steps };
}

/** What the agent is doing right now, for the live status line. */
export function currentActivity(message: UIMessage | undefined): {
  readonly activity: Activity;
  readonly name: string | null;
} {
  const last = message?.parts.at(-1);
  if (!last) {
    return { activity: ACTIVITIES.thinking, name: null };
  }
  if (isReasoningUIPart(last)) {
    return { activity: ACTIVITIES.reasoning, name: null };
  }
  if (isTextUIPart(last)) {
    return { activity: ACTIVITIES.answering, name: null };
  }
  if (isToolUIPart(last)) {
    const name = toolNameOf(last);
    return isRunning(last)
      ? { activity: activityOf(name), name }
      : { activity: ACTIVITIES.thinking, name: null };
  }
  return { activity: ACTIVITIES.thinking, name: null };
}

/** The Knowledge Keys a Conversation recorded or edited, each once, oldest first. */
export function capturedKeys(messages: readonly UIMessage[]): string[] {
  const keys: string[] = [];
  for (const message of messages) {
    if (message.role !== 'assistant') {
      continue;
    }
    for (const part of message.parts) {
      if (!isToolUIPart(part) || part.state !== 'output-available') {
        continue;
      }
      const name = toolNameOf(part);
      if (!/^(record|edit)_/.test(name)) {
        continue;
      }
      const item = touchedItem(part);
      if (item && !keys.includes(item.key)) {
        keys.push(item.key);
      }
    }
  }
  return keys;
}

/** The text of a user message, as the transcript shows it. */
export function textOf(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map(part => part.text)
    .join('\n');
}
