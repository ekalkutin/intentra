import { KeyRound, LogOut, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  pendingInvitations,
  useReceivedInvitationsQuery,
} from '@/entities/invitation';
import { useMeQuery } from '@/entities/session';
import { ThemeMenu } from '@/features/switch-theme';
import { ROUTES, WORKSPACE_PAGES, workspacePath } from '@/shared/config';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/ui';

import { useSignOut } from '../model/use-sign-out';

/** Who is signed in: their invitations, their own tokens in this Workspace, the theme, and the way out. */
export function AccountMenu({
  workspaceSlug,
}: {
  /** The Workspace the person is in; its tokens are theirs alone, so they live here. */
  readonly workspaceSlug?: string;
}) {
  const { t } = useTranslation();
  const signOut = useSignOut();
  const { data: me } = useMeQuery();
  const { data: received = [] } = useReceivedInvitationsQuery();
  const invitations = pendingInvitations(received).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            className='relative rounded-full'
            aria-label={t('shell.account')}
          />
        }
      >
        <Avatar size='sm'>
          <AvatarFallback className='text-xs uppercase'>
            {me?.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {invitations > 0 && (
          <span
            aria-hidden
            className='absolute top-0.5 right-0.5 size-2 rounded-full bg-brand ring-2 ring-background'
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-60'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='truncate font-normal text-muted-foreground'>
            {me?.email}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to={ROUTES.invitations} />}>
          <Mail />
          {t('shell.receivedInvitations')}
          {invitations > 0 && (
            <DropdownMenuShortcut className='font-mono'>
              {invitations}
            </DropdownMenuShortcut>
          )}
        </DropdownMenuItem>
        {workspaceSlug && (
          <DropdownMenuItem
            render={
              <Link to={workspacePath(workspaceSlug, WORKSPACE_PAGES.tokens)} />
            }
          >
            <KeyRound />
            {t('shell.workspacePages.tokens')}
          </DropdownMenuItem>
        )}
        <ThemeMenu />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut />
          {t('signOut.submit')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
