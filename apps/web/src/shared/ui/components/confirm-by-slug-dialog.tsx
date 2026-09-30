import { useId, useState, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
import { Field, FieldError, FieldLabel } from '../primitives/field';
import { Input } from '../primitives/input';
import { Spinner } from '../primitives/spinner';

/**
 * Asks for the slug before something is deleted for good, so a Workspace or
 * a Project is never deleted by a slip. The server checks the slug again.
 */
export function ConfirmBySlugDialog({
  trigger,
  title,
  description,
  slug,
  confirmLabel,
  error,
  onConfirm,
}: {
  readonly trigger: ReactElement;
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly slug: string;
  readonly confirmLabel: ReactNode;
  /** What went wrong on the last try, in the person's words. */
  readonly error?: string | null;
  /** Resolves once the request is done; the dialog stays open if it failed. */
  readonly onConfirm: (slug: string) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    const done = await onConfirm(typed);
    setPending(false);
    if (done) {
      setOpen(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        setTyped('');
      }}
    >
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={inputId}>
            {t('confirmBySlug.label', { slug })}
          </FieldLabel>
          <Input
            id={inputId}
            value={typed}
            autoComplete='off'
            spellCheck={false}
            className='font-mono'
            aria-invalid={Boolean(error)}
            onChange={event => setTyped(event.target.value)}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <Button
            variant='destructive'
            disabled={typed !== slug || pending}
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
