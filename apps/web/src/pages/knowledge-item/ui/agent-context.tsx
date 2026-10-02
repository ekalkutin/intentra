import { Bot, Check, ChevronRight, Copy } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  KnowledgeMarkdown,
  useKnowledgeContextQuery,
  useKnowledgeFrameQuery,
  type InProject,
} from '@/entities/knowledge-item';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import { useCopy } from '@/shared/lib';
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Spinner,
} from '@/shared/ui';

import { IconAction } from './icon-action';

/**
 * The Context Pack an agent gets with this Approved item as its Anchor, as
 * the agent reads it, and the same text to copy into any chat, the Project
 * Frame first unless left out.
 */
export function AgentContext({
  scope,
  itemKey,
}: {
  readonly scope: InProject;
  readonly itemKey: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <IconAction
        label={t('agentContext.open')}
        render={<SheetTrigger />}
        nativeButton
      >
        <Bot />
      </IconAction>
      <SheetContent side='right' className='w-full gap-0 sm:max-w-2xl'>
        <SheetHeader className='border-b border-border'>
          <SheetTitle>{t('agentContext.title')}</SheetTitle>
          <SheetDescription>{t('agentContext.description')}</SheetDescription>
        </SheetHeader>
        {open && <AgentContextBody scope={scope} itemKey={itemKey} />}
      </SheetContent>
    </Sheet>
  );
}

function AgentContextBody({
  scope,
  itemKey,
}: {
  readonly scope: InProject;
  readonly itemKey: string;
}) {
  const { t } = useTranslation();
  const id = useId();
  const describeError = useDescribeError();
  const { copied, copy } = useCopy();
  const [withFrame, setWithFrame] = useState(true);
  const pack = useKnowledgeContextQuery({ ...scope, anchors: [itemKey] });
  const frame = useKnowledgeFrameQuery(scope);
  const failure = toApiError(pack.error) ?? toApiError(frame.error);
  const text =
    pack.data &&
    frame.data &&
    (withFrame
      ? `${frame.data.markdown}\n${pack.data.markdown}`
      : pack.data.markdown);

  return (
    <>
      <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4'>
        {failure && (
          <Alert variant='destructive'>
            <AlertDescription>{describeError(failure).text}</AlertDescription>
          </Alert>
        )}
        {!failure && !text && (
          <div className='flex justify-center py-10'>
            <Spinner />
          </div>
        )}
        {frame.data && pack.data && (
          <>
            <Collapsible className='rounded-lg border border-border'>
              <CollapsibleTrigger className='group flex w-full items-center gap-2 px-3 py-2 text-left text-sm'>
                <ChevronRight className='size-4 text-muted-foreground transition-transform group-data-[panel-open]:rotate-90' />
                <span className='font-medium'>
                  {t('agentContext.frame', {
                    count: frame.data.items.length,
                  })}
                </span>
                <span className='text-muted-foreground'>
                  {t('agentContext.frameHint')}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className='border-t border-border px-3 py-3'>
                <KnowledgeMarkdown>{frame.data.markdown}</KnowledgeMarkdown>
              </CollapsibleContent>
            </Collapsible>
            <KnowledgeMarkdown>{pack.data.markdown}</KnowledgeMarkdown>
          </>
        )}
      </div>
      <SheetFooter className='flex-row flex-wrap items-center justify-between gap-3 border-t border-border'>
        <div className='flex items-center gap-2'>
          <Checkbox
            id={`${id}-frame`}
            checked={withFrame}
            onCheckedChange={checked => setWithFrame(checked === true)}
          />
          <Label htmlFor={`${id}-frame`}>{t('agentContext.withFrame')}</Label>
        </div>
        <Button disabled={!text} onClick={() => text && void copy(text)}>
          {copied ? <Check /> : <Copy />}
          {copied ? t('agentContext.copied') : t('agentContext.copy')}
        </Button>
      </SheetFooter>
    </>
  );
}
