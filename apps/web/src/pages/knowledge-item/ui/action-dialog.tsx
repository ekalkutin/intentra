import { useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Spinner,
  Textarea,
} from '@/shared/ui';

/**
 * Asks before a change to the item's status, optionally with a reason. Opened
 * from a menu, so it is controlled by its owner.
 */
export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  withReason,
  onConfirm,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly confirmLabel: ReactNode;
  readonly withReason: boolean;
  /** Resolves with the error to show, or null once done. */
  readonly onConfirm: (reason: string | null) => Promise<string | null>;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = (next: boolean) => {
    if (!next) {
      setReason('');
      setError(null);
    }
    onOpenChange(next);
  };

  const confirm = async () => {
    setPending(true);
    const failure = await onConfirm(reason.trim() || null);
    setPending(false);
    if (failure) {
      setError(failure);
      return;
    }
    change(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={change}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {withReason && (
          <Field>
            <FieldLabel htmlFor={`${id}-reason`}>
              {t('knowledgeItem.reason')}
            </FieldLabel>
            <Textarea
              id={`${id}-reason`}
              value={reason}
              maxLength={2000}
              onChange={event => setReason(event.target.value)}
              className='max-h-60'
            />
            <FieldDescription>{t('knowledgeItem.reasonHint')}</FieldDescription>
          </Field>
        )}
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <Button
            variant='destructive'
            disabled={pending}
            onClick={() => void confirm()}
          >
            {pending && <Spinner />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
