import {
  BookOpenText,
  Check,
  CircleAlert,
  FilePen,
  FilePlus2,
  FolderKanban,
  GitFork,
  Loader2,
  Search,
  Trash2,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { KeyLink } from '@/features/knowledge/badges';
import { KINDS } from '@/features/knowledge/kinds';
import { cn } from '@/lib/utils';

import type { ToolPart } from './chat-slice';

type Described = { icon: LucideIcon; running: string; done: string };

function kindLabel(snake: string): string {
  const kind = snake.replace(/_/g, '-');
  return KINDS.find(k => k.kind === kind)?.label ?? kind;
}

function describe(toolName: string): Described {
  const record = /^record_(.+)$/.exec(toolName);
  if (record?.[1]) {
    const label = kindLabel(record[1]);
    return {
      icon: FilePlus2,
      running: `Записываю: ${label}…`,
      done: `Записан черновик: ${label}`,
    };
  }
  const edit = /^edit_(.+)$/.exec(toolName);
  if (edit?.[1]) {
    const label = kindLabel(edit[1]);
    return {
      icon: FilePen,
      running: `Правлю: ${label}…`,
      done: `Изменён черновик: ${label}`,
    };
  }
  switch (toolName) {
    case 'list_knowledge':
      return {
        icon: Search,
        running: 'Просматриваю знания…',
        done: 'Просмотрел знания',
      };
    case 'get_knowledge_item':
      return { icon: BookOpenText, running: 'Читаю…', done: 'Прочитал' };
    case 'get_knowledge_dependencies':
      return {
        icon: GitFork,
        running: 'Прослеживаю зависимости…',
        done: 'Проследил зависимости',
      };
    case 'list_projects':
      return {
        icon: FolderKanban,
        running: 'Смотрю список проектов…',
        done: 'Список проектов',
      };
    case 'confirm_knowledge_item':
      return { icon: Check, running: 'Подтверждаю…', done: 'Подтвердил' };
    case 'delete_knowledge_draft':
      return {
        icon: Trash2,
        running: 'Удаляю черновик…',
        done: 'Удалил черновик',
      };
    default:
      return { icon: Wrench, running: `${toolName}…`, done: toolName };
  }
}

/** The Knowledge Key a tool call touched, if any. */
export function touchedKey(part: ToolPart): string | undefined {
  const result = part.result as { key?: unknown; deleted?: unknown } | null;
  if (result && typeof result.key === 'string') return result.key;
  const args = part.args as { key?: unknown } | null;
  if (args && typeof args.key === 'string') return args.key;
  return undefined;
}

function errorText(result: unknown): string {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object' && 'message' in result) {
    return String((result as { message: unknown }).message);
  }
  return 'ошибка';
}

/** Tools that change knowledge; reading is the assistant's own business. */
const WRITING_TOOL = /^(record_|edit_|delete_|confirm_)/;

/**
 * Whether a tool call deserves a line in the answer: finished changes, and
 * anything that failed. Reads and calls still running are left to the
 * thinking status.
 */
export function isWorthShowing(part: ToolPart): boolean {
  if (!part.done) return false;
  return part.isError === true || WRITING_TOOL.test(part.toolName);
}

export function ToolActivity({ part }: { part: ToolPart }) {
  const { icon: Icon, running, done } = describe(part.toolName);
  const key = part.done && !part.isError ? touchedKey(part) : undefined;
  const count =
    part.toolName === 'list_knowledge' && part.done && !part.isError
      ? ((part.result as { items?: unknown[] } | null)?.items?.length ?? null)
      : null;

  return (
    <div
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground',
        part.isError && 'border-destructive/30 text-destructive',
      )}
      title={part.isError ? errorText(part.result) : undefined}
    >
      {!part.done ? (
        <Loader2 className='size-3.5 animate-spin' />
      ) : part.isError ? (
        <CircleAlert className='size-3.5' />
      ) : (
        <Icon className='size-3.5' />
      )}
      <span className='truncate'>
        {!part.done ? running : part.isError ? `${done} — ошибка` : done}
      </span>
      {key && part.toolName !== 'delete_knowledge_draft' && (
        <KeyLink itemKey={key} />
      )}
      {key && part.toolName === 'delete_knowledge_draft' && (
        <span className='font-mono'>{key}</span>
      )}
      {count !== null && <span>({count})</span>}
    </div>
  );
}
