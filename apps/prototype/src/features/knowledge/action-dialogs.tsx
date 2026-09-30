import { AlertTriangle, CheckCircle2, CornerDownRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import {
  useApproveKnowledgeMutation,
  useDependenciesQuery,
} from '@/api/knowledge-api';
import { ErrorAlert, ListSkeleton, Spinner } from '@/components/common';
import { InlineMarkdown } from '@/components/markdown';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { KindBadge, NeedsReviewBadge, StatusBadge } from './badges';

/**
 * Approves an item together with every Draft it depends on, at any depth: the
 * API approves a batch all or nothing and refuses an item whose dependencies
 * are not Approved.
 */
export function ApproveDialog({
  workspaceId,
  projectId,
  itemKey,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  projectId: string;
  itemKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deps = useDependenciesQuery(
    { workspaceId, projectId, key: itemKey },
    { skip: !open, refetchOnMountOrArgChange: true },
  );
  const [approve, state] = useApproveKnowledgeMutation();

  const items = deps.data?.items ?? [];
  const batch = items.filter(i => i.status === 'draft');
  const blockers = items.filter(
    i =>
      i.status === 'rejected' ||
      i.status === 'obsolete' ||
      (i.status === 'draft' && (i.needsReview || !i.access.canApprove)),
  );

  const submit = async () => {
    try {
      const approved = await approve({
        workspaceId,
        projectId,
        items: batch.map(({ key, version }) => ({ key, version })),
      }).unwrap();
      toast.success(
        approved.length === 1
          ? `${approved[0]?.key} утверждён`
          : `Утверждено вместе: ${approved.length}`,
      );
      onOpenChange(false);
    } catch {
      // Shown from the mutation state.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) state.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Утвердить {itemKey}</DialogTitle>
          <DialogDescription>
            Элемент утверждается вместе со всеми черновиками, от которых он
            зависит.
          </DialogDescription>
        </DialogHeader>
        {deps.isLoading ? (
          <ListSkeleton rows={2} />
        ) : (
          <div className='max-h-80 space-y-1.5 overflow-y-auto'>
            {items.map((item, index) => {
              const inBatch = item.status === 'draft';
              return (
                <div
                  key={item.key}
                  className='flex items-start gap-2 rounded-lg border p-2.5 text-sm'
                >
                  {index === 0 ? (
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                  ) : (
                    <CornerDownRight className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
                  )}
                  <div className='min-w-0 flex-1 space-y-1'>
                    <div className='flex flex-wrap items-center gap-1.5'>
                      <span className='font-mono text-xs font-medium'>
                        {item.key}
                      </span>
                      <KindBadge kind={item.kind} />
                      <StatusBadge status={item.status} />
                      {item.needsReview && <NeedsReviewBadge />}
                    </div>
                    <div className='font-medium'>{item.title}</div>
                    <div className='line-clamp-2 text-muted-foreground'>
                      <InlineMarkdown>{item.mainField}</InlineMarkdown>
                    </div>
                  </div>
                  {inBatch && (
                    <span className='shrink-0 text-xs text-emerald-700 dark:text-emerald-400'>
                      будет утверждён
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {blockers.length > 0 && (
          <Alert variant='destructive'>
            <AlertTriangle />
            <AlertTitle>Пока нельзя утвердить</AlertTitle>
            <AlertDescription>
              {blockers.map(b => b.key).join(', ')}: сначала уберите связи с
              отклонёнными или устаревшими элементами и подтвердите черновики,
              которые требуют проверки.
            </AlertDescription>
          </Alert>
        )}
        <ErrorAlert error={state.error} />
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={submit}
            disabled={
              state.isLoading ||
              deps.isLoading ||
              batch.length === 0 ||
              blockers.length > 0
            }
          >
            {state.isLoading && <Spinner />}
            {batch.length > 1 ? `Утвердить (${batch.length})` : 'Утвердить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Asks for an optional reason, for rejecting or retiring. */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (reason: string | null) => Promise<unknown>;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const change = (next: boolean) => {
    if (!next) {
      setReason('');
      setError(null);
    }
    onOpenChange(next);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await onConfirm(reason.trim() || null);
      change(false);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent>
        <form onSubmit={submit} className='space-y-4'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            <Label htmlFor='reason'>Причина (необязательно)</Label>
            <Textarea
              id='reason'
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <ErrorAlert error={error} />
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => change(false)}
            >
              Отмена
            </Button>
            <Button type='submit' variant='destructive' disabled={busy}>
              {busy && <Spinner />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
