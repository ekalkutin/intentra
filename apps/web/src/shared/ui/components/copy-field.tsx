import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCopy } from '@/shared/lib';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../primitives/input-group';

/** A value to copy as is, such as a token's secret or an address. */
export function CopyField({
  value,
  label,
}: {
  readonly value: string;
  readonly label: string;
}) {
  const { t } = useTranslation();
  const { copied, copy } = useCopy();

  return (
    <InputGroup>
      <InputGroupInput
        readOnly
        value={value}
        aria-label={label}
        className='font-mono text-xs'
        onFocus={event => event.target.select()}
      />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          size='icon-xs'
          aria-label={copied ? t('common.copied') : t('common.copy')}
          onClick={() => void copy(value)}
        >
          {copied ? <Check /> : <Copy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
