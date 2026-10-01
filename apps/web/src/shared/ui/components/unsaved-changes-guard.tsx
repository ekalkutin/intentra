import { useEffect, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../primitives/alert-dialog';
import { Button } from '../primitives/button';

/**
 * While `when` holds, leaving the page asks first: moving to another page of
 * the app opens a dialog, closing or reloading the tab asks the browser's way.
 */
export function UnsavedChangesGuard({
  when,
  saved,
}: {
  readonly when: boolean;
  /** Set once the changes are saved, so the navigation right after passes before the page re-renders. */
  readonly saved?: RefObject<boolean>;
}) {
  const { t } = useTranslation();
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when &&
      !saved?.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [when]);

  return (
    <AlertDialog
      open={blocker.state === 'blocked'}
      onOpenChange={open => {
        if (!open && blocker.state === 'blocked') {
          blocker.reset();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('unsavedChanges.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('unsavedChanges.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('unsavedChanges.stay')}</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={() => blocker.state === 'blocked' && blocker.proceed()}
          >
            {t('unsavedChanges.leave')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
