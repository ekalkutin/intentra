import { useQuery } from '@apollo/client/react';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox';

import { AGENT_PROFILE_OPTIONS_QUERY } from '../api/agent-profile-options.query';

type ModelComboboxProps = {
  readonly id: string;
  readonly value: string;
  readonly onChange: (model: string) => void;
  readonly invalid?: boolean;
};

/** Every model OpenRouter offers, searched by id: `claude` finds all of Anthropic's. */
export const ModelCombobox = ({
  id,
  value,
  onChange,
  invalid,
}: ModelComboboxProps) => {
  const { data, loading } = useQuery(AGENT_PROFILE_OPTIONS_QUERY);
  const models = data?.models ?? [];
  const names = new Map(models.map(model => [model.id, model.name]));

  return (
    <Combobox
      items={models.map(model => model.id)}
      value={value || null}
      onValueChange={next => onChange(next ?? '')}
    >
      <ComboboxInput
        id={id}
        placeholder={
          loading ? 'Loading models…' : 'anthropic/claude-sonnet-4.5'
        }
        aria-invalid={invalid}
      />
      <ComboboxContent>
        <ComboboxEmpty>No such model on OpenRouter.</ComboboxEmpty>
        <ComboboxList>
          {(model: string) => (
            <ComboboxItem key={model} value={model}>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate'>{names.get(model)}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {model}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
