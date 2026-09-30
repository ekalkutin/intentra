import { toast } from 'sonner';

import {
  useChangeProjectRoleMutation,
  useProjectRolesQuery,
} from '@/api/workspace-api';
import { ErrorAlert, ListSkeleton, PageHeader } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PROJECT_ROLE_HINT,
  ProjectRoleBadge,
} from '@/features/workspace/role-badges';
import { useProject, useWorkspace } from '@/hooks/use-workspace';
import { errorMessage } from '@/lib/errors';
import type { ProjectRoleDto } from '@intentra/contracts/workspace';

const ROLES: ProjectRoleDto[] = ['viewer', 'contributor', 'maintainer'];

const ROLE_LABEL: Record<ProjectRoleDto, string> = {
  viewer: 'Читатель',
  contributor: 'Автор',
  maintainer: 'Сопровождающий',
};

export function ProjectRolesPage() {
  const { workspaceId, projectId, projectAccess } = useProject();
  const { access, members } = useWorkspace();
  const roles = useProjectRolesQuery({ workspaceId, projectId });
  const [change] = useChangeProjectRoleMutation();
  const canChange = projectAccess?.canChangeProjectRoles ?? false;
  const owners = new Set(
    members.filter(m => m.role === 'owner').map(m => m.id),
  );

  return (
    <div className='mx-auto max-w-4xl p-6 md:p-8'>
      <PageHeader
        title='Роли в проекте'
        description='Читатели читают, Авторы вносят и правят черновики, Сопровождающие ещё и утверждают. Владельцы всегда Сопровождающие.'
      />
      <ErrorAlert error={roles.error} />
      {roles.isLoading ? (
        <ListSkeleton />
      ) : (
        <div className='rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Участник</TableHead>
                <TableHead className='w-56'>Роль в проекте</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.data?.map(row => (
                <TableRow key={row.memberId}>
                  <TableCell>
                    <span className='font-medium'>{row.email}</span>{' '}
                    {row.memberId === access?.memberId && (
                      <Badge variant='outline'>вы</Badge>
                    )}{' '}
                    {owners.has(row.memberId) && (
                      <Badge variant='secondary'>Владелец</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {canChange && !owners.has(row.memberId) ? (
                      <Select
                        value={row.role}
                        onValueChange={async value => {
                          try {
                            await change({
                              workspaceId,
                              projectId,
                              memberId: row.memberId,
                              role: value as ProjectRoleDto,
                            }).unwrap();
                            toast.success(
                              `${row.email}: теперь ${ROLE_LABEL[value as ProjectRoleDto]}`,
                            );
                          } catch (error) {
                            toast.error(errorMessage(error));
                          }
                        }}
                      >
                        <SelectTrigger className='w-44'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(role => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABEL[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <ProjectRoleBadge role={row.role} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ul className='mt-6 space-y-1 text-sm text-muted-foreground'>
        {ROLES.map(role => (
          <li key={role}>
            <span className='font-medium text-foreground'>
              {ROLE_LABEL[role]}
            </span>{' '}
            — {PROJECT_ROLE_HINT[role]}
          </li>
        ))}
      </ul>
    </div>
  );
}
