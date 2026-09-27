import { setTheme, THEME, useTheme, type Theme } from '@/shared/lib/theme';
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select';

const THEME_LABELS: Record<Theme, string> = {
  [THEME.SYSTEM]: 'System',
  [THEME.LIGHT]: 'Light',
  [THEME.DARK]: 'Dark',
};

export const ThemeSelect = () => {
  const theme = useTheme();

  return (
    <NativeSelect
      className='w-full'
      aria-label='Theme'
      value={theme}
      onChange={event => setTheme(event.target.value as Theme)}
    >
      {Object.values(THEME).map(value => (
        <NativeSelectOption key={value} value={value}>
          {THEME_LABELS[value]}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
};
