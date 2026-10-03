import { useTranslation } from 'react-i18next';

import {
  InitialTile,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import type { WorkspaceDto } from '@intentra/contracts/workspace';

/**
 * Picks one of the person's Workspaces, each shown as in the sidebar: its
 * initial and its name. With nothing chosen it asks to choose.
 */
export function WorkspaceSelect({
  workspaces,
  value,
  onValueChange,
}: {
  readonly workspaces: readonly WorkspaceDto[];
  /** The id of the chosen Workspace. */
  readonly value: string | null;
  readonly onValueChange: (workspaceId: string) => void;
}) {
  const { t } = useTranslation();
  const items = workspaces.map(workspace => ({
    value: workspace.id,
    label: workspace.name,
  }));

  return (
    <Select
      items={items}
      value={value}
      onValueChange={next => next && onValueChange(next)}
    >
      <SelectTrigger className='w-full pl-2'>
        <SelectValue>
          {(chosenId: string | null) => {
            const chosen = items.find(item => item.value === chosenId);

            return chosen ? (
              <>
                <InitialTile name={chosen.label} />
                {chosen.label}
              </>
            ) : (
              <span className='pl-0.5 text-muted-foreground'>
                {t('workspaceSelect.placeholder')}
              </span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {items.map(item => (
          <SelectItem key={item.value} value={item.value}>
            <InitialTile name={item.label} />
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
