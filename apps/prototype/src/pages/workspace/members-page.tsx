import { MoreHorizontal, UserMinus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useChangeMemberRoleMutation,
  useRemoveMemberMutation,
} from '@/api/workspace-api';
import { ConfirmDialog, ListSkeleton, PageHeader } from '@/components/common';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RoleBadge } from '@/features/workspace/role-badges';
import { useWorkspace } from '@/hooks/use-workspace';
import { errorMessage } from '@/lib/errors';
import { initials } from '@/lib/format';
import type { MemberDto, RoleDto } from '@intentra/contracts/workspace';

export function MembersPage() {
  const { workspaceId, access, members } = useWorkspace();
  const [changeRole] = useChangeMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [removing, setRemoving] = useState<MemberDto | null>(null);
  const canManage = access?.canManageMembers ?? false;

  const setRole = async (member: MemberDto, role: RoleDto | null) => {
    try {
      await changeRole({ workspaceId, memberId: member.id, role }).unwrap();
      toast.success(
        `${member.email}: ${role === 'owner' ? 'теперь Владелец' : role === 'manager' ? 'теперь Менеджер' : 'роль снята'}`,
      );
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className='mx-auto max-w-4xl p-6 md:p-10'>
      <PageHeader
        title='Участники'
        description='Владельцы управляют пространством, Менеджеры создают проекты. Роли в проектах задаются для каждого проекта отдельно.'
      />
      {!access ? (
        <ListSkeleton />
      ) : (
        <div className='rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Участник</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className='w-12' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-8'>
                        <AvatarFallback className='text-xs'>
                          {initials(member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-medium'>{member.email}</span>
                      {member.id === access.memberId && (
                        <Badge variant='outline'>вы</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={member.role} />
                  </TableCell>
                  <TableCell>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label='Действия с участником'
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-52'>
                          <DropdownMenuLabel>
                            Роль в пространстве
                          </DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={member.role ?? 'none'}
                            onValueChange={value =>
                              setRole(
                                member,
                                value === 'none' ? null : (value as RoleDto),
                              )
                            }
                          >
                            <DropdownMenuRadioItem value='owner'>
                              Владелец
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value='manager'>
                              Менеджер
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value='none'>
                              Без роли
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                          {member.id !== access.memberId && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant='destructive'
                                onSelect={() => setRemoving(member)}
                              >
                                <UserMinus /> Удалить из пространства
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={open => !open && setRemoving(null)}
        title={`Удалить ${removing?.email}?`}
        description='Участник потеряет доступ ко всем проектам пространства, его токены доступа будут отозваны.'
        confirmLabel='Удалить'
        onConfirm={async () => {
          if (!removing) return;
          await removeMember({ workspaceId, memberId: removing.id }).unwrap();
          toast.success(`${removing.email} удалён из пространства`);
        }}
      />
    </div>
  );
}
