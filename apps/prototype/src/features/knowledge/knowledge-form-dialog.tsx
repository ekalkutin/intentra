import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  useEditKnowledgeMutation,
  useKnowledgeQuery,
  useRecordKnowledgeMutation,
} from '@/api/knowledge-api';
import { ErrorAlert, Spinner } from '@/components/common';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type {
  EditKnowledgeItemDto,
  KnowledgeItemDto,
  KnowledgeKindDto,
  KnowledgeLinkDto,
  KnowledgeLinkTypeDto,
  RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';

import {
  emptyFields,
  enumLabel,
  KIND_BY_ID,
  KINDS,
  LINK_TYPES,
  type FieldSpec,
} from './kinds';

type Fields = Record<string, unknown>;
type Alternative = { alternative: string; reason: string | null };

export type KnowledgeFormMode =
  | { type: 'record'; kind?: KnowledgeKindDto }
  | { type: 'edit'; item: KnowledgeItemDto }
  | { type: 'replace'; item: KnowledgeItemDto };

const NONE = '__none__';

function ListEditor({
  label,
  itemLabel,
  addLabel,
  value,
  onChange,
}: {
  label: string;
  itemLabel: string;
  addLabel: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      {value.map((entry, index) => (
        <div key={index} className='flex gap-2'>
          <Input
            value={entry}
            placeholder={`${itemLabel} ${index + 1}`}
            onChange={e =>
              onChange(value.map((v, i) => (i === index ? e.target.value : v)))
            }
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Удалить'
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <X />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => onChange([...value, ''])}
      >
        <Plus /> {addLabel}
      </Button>
    </div>
  );
}

function AlternativesEditor({
  value,
  onChange,
}: {
  value: Alternative[];
  onChange: (value: Alternative[]) => void;
}) {
  const update = (index: number, patch: Partial<Alternative>) =>
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  return (
    <div className='space-y-2'>
      <Label>Отвергнутые варианты</Label>
      {value.map((entry, index) => (
        <div key={index} className='flex gap-2'>
          <div className='grid flex-1 gap-2 sm:grid-cols-2'>
            <Input
              placeholder='Вариант'
              value={entry.alternative}
              onChange={e => update(index, { alternative: e.target.value })}
            />
            <Input
              placeholder='Почему от него отказались'
              value={entry.reason ?? ''}
              onChange={e => update(index, { reason: e.target.value })}
            />
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Удалить'
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <X />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => onChange([...value, { alternative: '', reason: null }])}
      >
        <Plus /> Добавить вариант
      </Button>
    </div>
  );
}

function FieldEditor({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (spec.type) {
    case 'text':
      return (
        <div className='space-y-2'>
          <Label htmlFor={spec.name}>
            {spec.label}
            {spec.main && <span className='text-destructive'>*</span>}
          </Label>
          <Textarea
            id={spec.name}
            required={spec.main}
            rows={spec.main ? 3 : 2}
            placeholder={spec.hint}
            value={(value as string | null) ?? ''}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      );
    case 'enum':
      return (
        <div className='space-y-2'>
          <Label>{spec.label}</Label>
          <Select
            value={(value as string | null) ?? NONE}
            onValueChange={v => onChange(v === NONE ? null : v)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>
                <span className='text-muted-foreground'>Пока неизвестно</span>
              </SelectItem>
              {spec.options.map(option => (
                <SelectItem key={option} value={option}>
                  {enumLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case 'list':
      return (
        <ListEditor
          label={spec.label}
          itemLabel={spec.itemLabel}
          addLabel={spec.addLabel}
          value={(value as string[] | undefined) ?? []}
          onChange={onChange}
        />
      );
    case 'alternatives':
      return (
        <AlternativesEditor
          value={(value as Alternative[] | undefined) ?? []}
          onChange={onChange}
        />
      );
  }
}

/** What the API expects: empty optional texts become null, empty entries go. */
function cleanFields(kind: KnowledgeKindDto, fields: Fields): Fields {
  const clean: Fields = {};
  for (const spec of KIND_BY_ID[kind].fields) {
    const value = fields[spec.name];
    switch (spec.type) {
      case 'text': {
        const text = typeof value === 'string' ? value.trim() : '';
        clean[spec.name] = spec.main ? text : text || null;
        break;
      }
      case 'enum':
        clean[spec.name] = value ?? null;
        break;
      case 'list':
        clean[spec.name] = ((value as string[] | undefined) ?? [])
          .map(s => s.trim())
          .filter(Boolean);
        break;
      case 'alternatives':
        clean[spec.name] = ((value as Alternative[] | undefined) ?? [])
          .filter(a => a.alternative.trim())
          .map(a => ({
            alternative: a.alternative.trim(),
            reason: a.reason?.trim() || null,
          }));
        break;
    }
  }
  return clean;
}

function LinksEditor({
  workspaceId,
  projectId,
  selfKey,
  value,
  onChange,
}: {
  workspaceId: string;
  projectId: string;
  selfKey?: string;
  value: KnowledgeLinkDto[];
  onChange: (value: KnowledgeLinkDto[]) => void;
}) {
  const { data } = useKnowledgeQuery({
    workspaceId,
    projectId,
    statuses: ['draft', 'approved'],
    take: 200,
  });
  const targets = (data?.items ?? []).filter(i => i.key !== selfKey);
  const update = (index: number, patch: Partial<KnowledgeLinkDto>) =>
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));

  return (
    <div className='space-y-2'>
      <Label>Связи</Label>
      {value.map((link, index) => (
        <div key={index} className='flex gap-2'>
          <Select
            value={link.type}
            onValueChange={type =>
              update(index, { type: type as KnowledgeLinkTypeDto })
            }
          >
            <SelectTrigger className='w-44 shrink-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LINK_TYPES.map(t => (
                <SelectItem key={t.type} value={t.type}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={link.key || undefined}
            onValueChange={key => update(index, { key })}
          >
            <SelectTrigger className='min-w-0 flex-1'>
              <SelectValue placeholder='Выберите элемент' />
            </SelectTrigger>
            <SelectContent>
              {targets.map(t => (
                <SelectItem key={t.key} value={t.key}>
                  <span className='font-mono text-xs'>{t.key}</span>
                  <span className='truncate'>{t.title}</span>
                  <span className='text-xs text-muted-foreground'>
                    {KIND_BY_ID[t.kind].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Удалить связь'
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <X />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={targets.length === 0}
        onClick={() => onChange([...value, { type: 'depends-on', key: '' }])}
      >
        <Plus /> Добавить связь
      </Button>
      {targets.length === 0 && (
        <p className='text-xs text-muted-foreground'>Пока не с чем связать.</p>
      )}
    </div>
  );
}

export function KnowledgeFormDialog({
  workspaceId,
  projectId,
  mode,
  canRecord,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  projectId: string;
  mode: KnowledgeFormMode;
  canRecord: KnowledgeKindDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [record, recordState] = useRecordKnowledgeMutation();
  const [edit, editState] = useEditKnowledgeMutation();
  const busy = recordState.isLoading || editState.isLoading;
  const error = recordState.error ?? editState.error;

  const initialKind: KnowledgeKindDto =
    mode.type === 'record'
      ? (mode.kind ?? canRecord[0] ?? 'requirement')
      : mode.item.kind;
  const [kind, setKind] = useState<KnowledgeKindDto>(initialKind);
  const [title, setTitle] = useState('');
  const [rationale, setRationale] = useState('');
  const [fields, setFields] = useState<Fields>({});
  const [links, setLinks] = useState<KnowledgeLinkDto[]>([]);

  const modeKey =
    mode.type === 'record'
      ? `record:${mode.kind ?? ''}`
      : `${mode.type}:${mode.item.key}:${mode.item.version}`;

  useEffect(() => {
    if (!open) return;
    recordState.reset();
    editState.reset();
    if (mode.type === 'record') {
      setKind(initialKind);
      setTitle('');
      setRationale('');
      setFields(emptyFields(initialKind));
      setLinks([]);
    } else {
      setKind(mode.item.kind);
      setTitle(mode.item.title);
      setRationale(mode.item.rationale ?? '');
      setFields(structuredClone(mode.item.fields) as Fields);
      setLinks(mode.item.links.map(l => ({ ...l })));
    }
    // Reset only when the dialog opens for another target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, modeKey]);

  const spec = KIND_BY_ID[kind];
  const kindOptions = useMemo(
    () => KINDS.filter(k => canRecord.includes(k.kind)),
    [canRecord],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanLinks = links.filter(l => l.key);
    const cleaned = cleanFields(kind, fields);
    try {
      if (mode.type === 'edit') {
        const body = {
          kind,
          version: mode.item.version,
          title: title.trim(),
          rationale: rationale.trim() || null,
          fields: cleaned,
          links: cleanLinks,
        } as EditKnowledgeItemDto;
        const item = await edit({
          workspaceId,
          projectId,
          key: mode.item.key,
          body,
        }).unwrap();
        toast.success(`${item.key} сохранён`);
        onOpenChange(false);
      } else {
        const body = {
          kind,
          title: title.trim(),
          rationale: rationale.trim() || null,
          supersedes: mode.type === 'replace' ? mode.item.key : null,
          links: cleanLinks,
          fields: cleaned,
        } as RecordKnowledgeItemDto;
        const item = await record({ workspaceId, projectId, body }).unwrap();
        toast.success(`${item.key} записан как черновик`);
        onOpenChange(false);
        navigate(`/w/${workspaceId}/p/${projectId}/knowledge/${item.key}`);
      }
    } catch {
      // Shown from the mutation state.
    }
  };

  const heading =
    mode.type === 'edit'
      ? `Изменить ${mode.item.key}`
      : mode.type === 'replace'
        ? `Предложить изменение ${mode.item.key}`
        : 'Записать знание';
  const description =
    mode.type === 'replace'
      ? 'Создаёт черновик, который заменит утверждённый элемент, когда сопровождающий его утвердит.'
      : mode.type === 'edit'
        ? 'Черновик можно менять, пока его не утвердили.'
        : 'Новое знание остаётся черновиком, пока сопровождающий его не утвердит.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
        <DialogHeader className='border-b p-6 pb-4'>
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1 overflow-y-auto'>
            <div className='space-y-5 p-6'>
              {mode.type === 'record' && (
                <div className='space-y-2'>
                  <Label>Вид</Label>
                  <Select
                    value={kind}
                    onValueChange={value => {
                      const next = value as KnowledgeKindDto;
                      setKind(next);
                      setFields(emptyFields(next));
                    }}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kindOptions.map(k => (
                        <SelectItem key={k.kind} value={k.kind}>
                          <k.icon /> {k.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-muted-foreground'>
                    {spec.description}
                  </p>
                </div>
              )}
              <div className='space-y-2'>
                <Label htmlFor='title'>
                  Заголовок<span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='title'
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              {spec.fields.map(field => (
                <FieldEditor
                  key={`${kind}.${field.name}`}
                  spec={field}
                  value={fields[field.name]}
                  onChange={value =>
                    setFields(prev => ({ ...prev, [field.name]: value }))
                  }
                />
              ))}
              <Separator />
              <div className='space-y-2'>
                <Label htmlFor='rationale'>Обоснование</Label>
                <Textarea
                  id='rationale'
                  rows={2}
                  placeholder='На чём это основано: разговор, документ, заинтересованное лицо…'
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                />
              </div>
              <LinksEditor
                workspaceId={workspaceId}
                projectId={projectId}
                selfKey={mode.type === 'record' ? undefined : mode.item.key}
                value={links}
                onChange={setLinks}
              />
              <ErrorAlert error={error} />
            </div>
          </div>
          <DialogFooter className='m-0 border-t p-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type='submit' disabled={busy}>
              {busy && <Spinner />}
              {mode.type === 'edit' ? 'Сохранить' : 'Записать черновик'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
