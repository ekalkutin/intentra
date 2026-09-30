import { Check, Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import {
  useCreateTokenMutation,
  useRevokeTokenMutation,
  useTokensQuery,
} from '@/api/workspace-api';
import {
  ConfirmDialog,
  EmptyState,
  ErrorAlert,
  ListSkeleton,
  PageHeader,
  Spinner,
} from '@/components/common';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PROJECT_ROLE_HINT,
  ProjectRoleBadge,
} from '@/features/workspace/role-badges';
import { useWorkspace } from '@/hooks/use-workspace';
import { formatDate, formatRelative } from '@/lib/format';
import type {
  CreatedPersonalAccessTokenDto,
  PersonalAccessTokenDto,
  ProjectRoleDto,
} from '@intentra/contracts/workspace';

const LIFETIMES = [
  { value: '30', label: '30 дней' },
  { value: '90', label: '90 дней' },
  { value: '365', label: '1 год' },
  { value: 'never', label: 'Бессрочно' },
];

const LEVEL_LABEL: Record<ProjectRoleDto, string> = {
  viewer: 'Читатель',
  contributor: 'Автор',
  maintainer: 'Сопровождающий',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type='button'
      variant='outline'
      size='icon-sm'
      aria-label='Скопировать'
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}

function CreateTokenDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [create, state] = useCreateTokenMutation();
  const [name, setName] = useState('');
  const [level, setLevel] = useState<ProjectRoleDto>('contributor');
  const [lifetime, setLifetime] = useState('90');
  const [created, setCreated] = useState<CreatedPersonalAccessTokenDto | null>(
    null,
  );

  const change = (next: boolean) => {
    if (!next) {
      setName('');
      setLevel('contributor');
      setLifetime('90');
      setCreated(null);
      state.reset();
    }
    onOpenChange(next);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await create({
      workspaceId,
      name: name.trim(),
      level,
      lifetimeDays:
        lifetime === 'never' ? null : (Number(lifetime) as 30 | 90 | 365),
    })
      .unwrap()
      .catch(() => null);
    if (result) setCreated(result);
  };

  const mcpUrl = `${window.location.protocol}//${window.location.hostname}:3000/api/mcp`;
  const claudeCommand = created
    ? `claude mcp add --transport http intentra ${mcpUrl} --header "Authorization: Bearer ${created.secret}"`
    : '';

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className='sm:max-w-lg'>
        {created ? (
          <div className='min-w-0 space-y-4'>
            <DialogHeader>
              <DialogTitle>Токен создан</DialogTitle>
              <DialogDescription>
                Скопируйте его сейчас — он показывается только один раз.
              </DialogDescription>
            </DialogHeader>
            <div className='flex min-w-0 items-center gap-2'>
              <Input
                readOnly
                value={created.secret}
                className='font-mono text-xs'
              />
              <CopyButton text={created.secret} />
            </div>
            <div className='space-y-2'>
              <Label>Подключение Claude Code</Label>
              <div className='flex items-start gap-2'>
                <pre className='min-w-0 flex-1 rounded-md bg-muted p-3 text-xs break-all whitespace-pre-wrap'>
                  {claudeCommand}
                </pre>
                <CopyButton text={claudeCommand} />
              </div>
              <p className='text-xs text-muted-foreground'>
                Подойдёт любой MCP-клиент: адрес <code>{mcpUrl}</code>, токен —
                в заголовке Bearer.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => change(false)}>Готово</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className='space-y-4'>
            <DialogHeader>
              <DialogTitle>Новый токен доступа</DialogTitle>
              <DialogDescription>
                Позволяет внешнему агенту (Claude Code, Codex, Cursor) работать
                в этом пространстве от вашего имени через MCP.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-2'>
              <Label htmlFor='token-name'>Название</Label>
              <Input
                id='token-name'
                required
                autoFocus
                placeholder='Claude Code на моём ноутбуке'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Уровень</Label>
                <Select
                  value={level}
                  onValueChange={v => setLevel(v as ProjectRoleDto)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['viewer', 'contributor', 'maintainer'] as const).map(
                      r => (
                        <SelectItem key={r} value={r}>
                          {LEVEL_LABEL[r]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  {PROJECT_ROLE_HINT[level]}. Не больше вашей собственной роли в
                  проекте.
                </p>
              </div>
              <div className='space-y-2'>
                <Label>Срок действия</Label>
                <Select value={lifetime} onValueChange={setLifetime}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIFETIMES.map(l => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ErrorAlert error={state.error} />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => change(false)}
              >
                Отмена
              </Button>
              <Button type='submit' disabled={state.isLoading || !name.trim()}>
                {state.isLoading && <Spinner />}
                Создать токен
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TokensPage() {
  const { workspaceId, access } = useWorkspace();
  const tokens = useTokensQuery({ workspaceId });
  const [revoke] = useRevokeTokenMutation();
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<PersonalAccessTokenDto | null>(null);
  const showOwner = access?.canSeeAllPersonalAccessTokens ?? false;

  return (
    <div className='mx-auto max-w-5xl p-6 md:p-10'>
      <PageHeader
        title='Токены доступа'
        description='Личные токены доступа подключают внешних AI-агентов к этому пространству через MCP.'
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> Новый токен
          </Button>
        }
      />
      {showOwner && (
        <Alert className='mb-4'>
          <KeyRound />
          <AlertTitle>Вы видите токены всех участников</AlertTitle>
          <AlertDescription>
            Как Владелец вы можете отозвать любой из них.
          </AlertDescription>
        </Alert>
      )}
      <ErrorAlert error={tokens.error} />
      {tokens.isLoading ? (
        <ListSkeleton />
      ) : tokens.data?.length ? (
        <div className='rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                {showOwner && <TableHead>Участник</TableHead>}
                <TableHead>Уровень</TableHead>
                <TableHead>Последнее использование</TableHead>
                <TableHead>Истекает</TableHead>
                <TableHead className='w-12' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.data.map(token => (
                <TableRow key={token.id}>
                  <TableCell>
                    <div className='font-medium'>{token.name}</div>
                    <div className='font-mono text-xs text-muted-foreground'>
                      {token.secretHint}
                    </div>
                  </TableCell>
                  {showOwner && <TableCell>{token.memberEmail}</TableCell>}
                  <TableCell>
                    <ProjectRoleBadge role={token.level} />
                  </TableCell>
                  <TableCell title={formatDate(token.lastUsedAt)}>
                    {token.lastUsedAt
                      ? formatRelative(token.lastUsedAt)
                      : 'Никогда'}
                  </TableCell>
                  <TableCell title={formatDate(token.expiresAt)}>
                    {token.expiresAt
                      ? formatRelative(token.expiresAt)
                      : 'Бессрочно'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      aria-label='Отозвать токен'
                      onClick={() => setRevoking(token)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={KeyRound}
          title='Токенов доступа нет'
          description='Создайте токен, чтобы Claude Code или другой MCP-клиент мог читать и записывать знания этого пространства.'
        />
      )}
      <CreateTokenDialog
        workspaceId={workspaceId}
        open={creating}
        onOpenChange={setCreating}
      />
      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={open => !open && setRevoking(null)}
        title={`Отозвать «${revoking?.name}»?`}
        description='Агенты, которые его используют, сразу перестанут работать.'
        confirmLabel='Отозвать'
        onConfirm={async () => {
          if (!revoking) return;
          await revoke({ workspaceId, tokenId: revoking.id }).unwrap();
          toast.success('Токен отозван');
        }}
      />
    </div>
  );
}
