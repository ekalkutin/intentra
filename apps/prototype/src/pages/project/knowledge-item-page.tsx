import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Bot,
  Check,
  CheckCheck,
  GitBranchPlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import {
  useConfirmKnowledgeMutation,
  useDeleteKnowledgeMutation,
  useKnowledgeItemQuery,
  useRejectKnowledgeMutation,
  useRetireKnowledgeMutation,
} from '@/api/knowledge-api';
import { ConfirmDialog, ErrorAlert, ListSkeleton } from '@/components/common';
import { InlineMarkdown, Markdown } from '@/components/markdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ApproveDialog,
  ReasonDialog,
} from '@/features/knowledge/action-dialogs';
import {
  KeyLink,
  KindBadge,
  NeedsReviewBadge,
  StatusBadge,
} from '@/features/knowledge/badges';
import { ItemContext } from '@/features/knowledge/item-context';
import {
  enumLabel,
  KIND_BY_ID,
  type FieldSpec,
} from '@/features/knowledge/kinds';
import {
  KnowledgeFormDialog,
  type KnowledgeFormMode,
} from '@/features/knowledge/knowledge-form-dialog';
import { useProject, useWorkspace } from '@/hooks/use-workspace';
import { errorCode, errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

function FieldValue({ spec, value }: { spec: FieldSpec; value: unknown }) {
  const empty = (
    <span className='text-sm text-muted-foreground/80 italic'>
      Пока неизвестно
    </span>
  );
  switch (spec.type) {
    case 'text':
      return value ? <Markdown>{value as string}</Markdown> : empty;
    case 'enum':
      return value ? (
        <span className='text-[15px]'>{enumLabel(value as string)}</span>
      ) : (
        empty
      );
    case 'list': {
      const list = value as string[];
      return list.length ? (
        <ol className='list-decimal space-y-1.5 pl-5 text-[15px] leading-7 marker:text-muted-foreground'>
          {list.map((entry, i) => (
            <li key={i} className='pl-1'>
              <InlineMarkdown>{entry}</InlineMarkdown>
            </li>
          ))}
        </ol>
      ) : (
        empty
      );
    }
    case 'alternatives': {
      const list = value as { alternative: string; reason: string | null }[];
      return list.length ? (
        <ul className='space-y-2 text-[15px] leading-7'>
          {list.map((entry, i) => (
            <li key={i} className='border-l-2 pl-3'>
              <div className='font-medium'>
                <InlineMarkdown>{entry.alternative}</InlineMarkdown>
              </div>
              {entry.reason && (
                <div className='text-sm leading-6 text-muted-foreground'>
                  <InlineMarkdown>{entry.reason}</InlineMarkdown>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        empty
      );
    }
  }
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex justify-between gap-4 py-2 text-[13px] leading-5'>
      <span className='shrink-0 text-muted-foreground'>{label}</span>
      <span className='min-w-0 text-right break-words [overflow-wrap:anywhere]'>
        {children}
      </span>
    </div>
  );
}

type Dialog = 'approve' | 'reject' | 'retire' | 'delete' | null;

export function KnowledgeItemPage() {
  const { key = '' } = useParams();
  const { workspaceId, projectId } = useProject();
  const { memberEmail } = useWorkspace();
  const navigate = useNavigate();
  const query = useKnowledgeItemQuery({ workspaceId, projectId, key });
  const [dialog, setDialog] = useState<Dialog>(null);
  const [form, setForm] = useState<KnowledgeFormMode | null>(null);
  const [reject] = useRejectKnowledgeMutation();
  const [retire] = useRetireKnowledgeMutation();
  const [remove] = useDeleteKnowledgeMutation();
  const [confirm, confirmState] = useConfirmKnowledgeMutation();

  if (query.isLoading) {
    return (
      <div className='mx-auto max-w-5xl p-8'>
        <ListSkeleton rows={5} />
      </div>
    );
  }
  if (!query.data) {
    return (
      <div className='mx-auto max-w-xl p-8'>
        <ErrorAlert error={query.error} title={`Не удалось открыть ${key}`} />
        <Button asChild variant='link' className='px-0'>
          <Link to='..' relative='path'>
            К списку знаний
          </Link>
        </Button>
      </div>
    );
  }

  const item: KnowledgeItemDto = query.data;
  const spec = KIND_BY_ID[item.kind];
  const { access } = item;
  const ref = { workspaceId, projectId, key: item.key, version: item.version };
  const onChanged = (error: unknown) => {
    if (errorCode(error) === 'KNOWLEDGE_ITEM_CHANGED') query.refetch();
    throw error;
  };

  return (
    <div className='h-full overflow-y-auto'>
      <div className='mx-auto max-w-5xl space-y-6 p-4 md:p-8'>
        <Button asChild variant='ghost' size='sm' className='-ml-2'>
          <Link to='..' relative='path'>
            <ArrowLeft /> Знания
          </Link>
        </Button>

        <div className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-mono text-sm font-semibold'>{item.key}</span>
            <KindBadge kind={item.kind} />
            <StatusBadge status={item.status} />
            {item.needsReview && (
              <NeedsReviewBadge causes={item.reviewCauses} />
            )}
            {item.source === 'external-agent' && (
              <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                <Bot className='size-3.5' /> записано агентом
              </span>
            )}
          </div>
          <h1 className='max-w-3xl text-[28px] leading-tight font-semibold tracking-tight text-balance'>
            {item.title}
          </h1>
          <div className='flex flex-wrap gap-2'>
            {access.canApprove && (
              <Button size='sm' onClick={() => setDialog('approve')}>
                <Check /> Утвердить
              </Button>
            )}
            {access.canConfirm && (
              <Button
                size='sm'
                variant='outline'
                disabled={confirmState.isLoading}
                onClick={async () => {
                  try {
                    await confirm(ref).unwrap();
                    toast.success(
                      `${item.key}: подтверждено, что всё ещё верно`,
                    );
                  } catch (error) {
                    toast.error(errorMessage(error));
                    if (errorCode(error) === 'KNOWLEDGE_ITEM_CHANGED') {
                      query.refetch();
                    }
                  }
                }}
              >
                <CheckCheck /> Всё ещё верно
              </Button>
            )}
            {access.canEdit && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setForm({ type: 'edit', item })}
              >
                <Pencil /> Изменить
              </Button>
            )}
            {access.canRecordReplacement && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setForm({ type: 'replace', item })}
              >
                <GitBranchPlus /> Предложить изменение
              </Button>
            )}
            {access.canReject && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setDialog('reject')}
              >
                <X /> Отклонить
              </Button>
            )}
            {access.canRetire && (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setDialog('retire')}
              >
                <Archive /> Вывести из употребления
              </Button>
            )}
            {access.canDelete && (
              <Button
                size='sm'
                variant='ghost'
                className='text-destructive'
                onClick={() => setDialog('delete')}
              >
                <Trash2 /> Удалить
              </Button>
            )}
          </div>
        </div>

        {item.needsReview && (
          <Alert className='border-orange-500/40 bg-orange-500/5'>
            <AlertTriangle className='text-orange-600' />
            <AlertTitle>
              Изменилось то, на что опирается этот элемент
            </AlertTitle>
            <AlertDescription>
              <span>
                Проверьте, что он всё ещё верен:{' '}
                {item.reviewCauses.map((cause, i) => (
                  <span key={cause}>
                    {i > 0 && ', '}
                    <KeyLink itemKey={cause} />
                  </span>
                ))}
                . Подтвердите его или предложите изменение.
              </span>
            </AlertDescription>
          </Alert>
        )}
        {!item.needsReview && item.dependencyNeedsReview && (
          <Alert>
            <AlertTriangle />
            <AlertTitle>Ниже по цепочке что-то на проверке</AlertTitle>
            <AlertDescription>
              Один из элементов, от которых он зависит (прямо или через другие),
              помечен «требует проверки». Цепочка — в разделе «Контекст».
            </AlertDescription>
          </Alert>
        )}
        {item.status === 'obsolete' && item.supersededByKey && (
          <Alert>
            <GitBranchPlus />
            <AlertTitle>Заменено</AlertTitle>
            <AlertDescription>
              <span>
                Заменено на <KeyLink itemKey={item.supersededByKey} />{' '}
                {formatDate(item.supersededAt)}.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className='grid gap-6 lg:grid-cols-[1fr_300px]'>
          <div className='min-w-0 space-y-6'>
            <Card>
              <CardContent className='space-y-6'>
                <p className='text-[13px] text-muted-foreground'>
                  {spec.description}
                </p>
                {spec.fields.map(field => (
                  <section key={field.name} className='max-w-[68ch] space-y-1'>
                    <h3 className='text-[13px] font-medium text-muted-foreground'>
                      {field.label}
                    </h3>
                    <FieldValue
                      spec={field}
                      value={
                        (item.fields as Record<string, unknown>)[field.name]
                      }
                    />
                  </section>
                ))}
                <section className='max-w-[68ch] space-y-1 border-t pt-5'>
                  <h3 className='text-[13px] font-medium text-muted-foreground'>
                    Обоснование
                  </h3>
                  {item.rationale ? (
                    <Markdown className='text-muted-foreground'>
                      {item.rationale}
                    </Markdown>
                  ) : (
                    <span className='text-sm text-muted-foreground italic'>
                      Не указано
                    </span>
                  )}
                </section>
              </CardContent>
            </Card>

            <ItemContext item={item} />
          </div>

          <Card className='h-fit min-w-0'>
            <CardContent className='divide-y'>
              <Meta label='Записал'>{memberEmail(item.authorId)}</Meta>
              <Meta label='Записано'>{formatDate(item.recordedAt)}</Meta>
              {item.lastEditedAt && (
                <Meta label='Изменено'>
                  {formatDate(item.lastEditedAt)},{' '}
                  {memberEmail(item.lastEditedBy)}
                </Meta>
              )}
              {item.supersedes && (
                <Meta label='Заменяет'>
                  <KeyLink itemKey={item.supersedes} />
                </Meta>
              )}
              {item.approvedAt && (
                <Meta label='Утверждено'>
                  {formatDate(item.approvedAt)}, {memberEmail(item.approvedBy)}
                </Meta>
              )}
              {item.rejectedAt && (
                <Meta label='Отклонено'>
                  {formatDate(item.rejectedAt)}, {memberEmail(item.rejectedBy)}
                  {item.rejectionReason && (
                    <div className='text-muted-foreground'>
                      «{item.rejectionReason}»
                    </div>
                  )}
                </Meta>
              )}
              {item.retiredAt && (
                <Meta label='Выведено'>
                  {formatDate(item.retiredAt)}, {memberEmail(item.retiredBy)}
                  {item.retirementReason && (
                    <div className='text-muted-foreground'>
                      «{item.retirementReason}»
                    </div>
                  )}
                </Meta>
              )}
              <Meta label='Версия'>{item.version}</Meta>
            </CardContent>
          </Card>
        </div>
      </div>

      <ApproveDialog
        workspaceId={workspaceId}
        projectId={projectId}
        itemKey={item.key}
        open={dialog === 'approve'}
        onOpenChange={open => !open && setDialog(null)}
      />
      <ReasonDialog
        open={dialog === 'reject'}
        onOpenChange={open => !open && setDialog(null)}
        title={`Отклонить ${item.key}?`}
        description='Отклонённый черновик остаётся доступен по ключу, но исчезает из списков. Всё, что на него опирается, будет помечено «требует проверки».'
        confirmLabel='Отклонить'
        onConfirm={async reason => {
          await reject({ ...ref, reason })
            .unwrap()
            .catch(onChanged);
          toast.success(`${item.key} отклонён`);
        }}
      />
      <ReasonDialog
        open={dialog === 'retire'}
        onOpenChange={open => !open && setDialog(null)}
        title={`Вывести ${item.key} из употребления?`}
        description='Элемент станет устаревшим: он больше не верен, но сохранится в истории. Всё, что на него опирается, будет помечено «требует проверки».'
        confirmLabel='Вывести из употребления'
        onConfirm={async reason => {
          await retire({ ...ref, reason })
            .unwrap()
            .catch(onChanged);
          toast.success(`${item.key} выведен из употребления`);
        }}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        onOpenChange={open => !open && setDialog(null)}
        title={`Удалить ${item.key}?`}
        description='Удаление — для ошибок. Чтобы отказаться от черновика по существу, отклоните его.'
        confirmLabel='Удалить'
        onConfirm={async () => {
          await remove(ref).unwrap().catch(onChanged);
          toast.success(`${item.key} удалён`);
          navigate('..', { relative: 'path' });
        }}
      />
      {form && (
        <KnowledgeFormDialog
          workspaceId={workspaceId}
          projectId={projectId}
          mode={form}
          canRecord={[item.kind]}
          open
          onOpenChange={open => !open && setForm(null)}
        />
      )}
    </div>
  );
}
