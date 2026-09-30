import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';

import { CreateWorkspaceForm } from './create-workspace-form';

export function CreateWorkspaceDialog({
  trigger,
  open: openProp,
  onOpenChange,
}: {
  /** Opens the dialog; leave it out to open it from elsewhere with `open`. */
  readonly trigger?: ReactElement;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('createWorkspace.title')}</DialogTitle>
          <DialogDescription>
            {t('createWorkspace.description')}
          </DialogDescription>
        </DialogHeader>
        <CreateWorkspaceForm
          onCreated={() => setOpen(false)}
          footer={
            <DialogClose render={<Button variant='ghost' />}>
              {t('common.cancel')}
            </DialogClose>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
