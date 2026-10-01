import { useState, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '../primitives/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../primitives/alert-dialog';
import { Button } from '../primitives/button';
import { Spinner } from '../primitives/spinner';

/**
 * Asks once before an action that cannot be undone. Opened by its trigger, or
 * from outside with `open` (from a menu item, which would take a trigger away
 * with it as the menu closes).
 */
export function ConfirmDialog({
  trigger,
  open: openFromOutside,
  onOpenChange,
  title,
  description,
  confirmLabel,
  error,
  onConfirm,
}: {
  readonly trigger?: ReactElement;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly confirmLabel: ReactNode;
  readonly error?: string | null;
  /** Resolves once the request is done; the dialog stays open if it failed. */
  readonly onConfirm: () => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [openHere, setOpenHere] = useState(false);
  const open = openFromOutside ?? openHere;
  const setOpen = (next: boolean) => {
    setOpenHere(next);
    onOpenChange?.(next);
  };
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    const done = await onConfirm();
    setPending(false);
    if (done) {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
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
