/** Days until the token expires; `null` never expires. */
export const EXPIRY_OPTIONS: readonly {
  readonly days: number | null;
  readonly label: string;
}[] = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
  { days: null, label: 'Never' },
];

export const DEFAULT_EXPIRY_DAYS = 30;
