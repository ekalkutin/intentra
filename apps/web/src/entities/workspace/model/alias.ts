import { WORKSPACE_ALIAS_MAX_LENGTH } from '@intentra/contracts/workspace';

import { CELESTIAL_NAMES } from './celestial-names';

const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const SUFFIX_LENGTH = 4;

/** `Acme Labs!` → `acme-labs`; empty when the name has no latin letters or digits. */
export const nameToWorkspaceAlias = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, WORKSPACE_ALIAS_MAX_LENGTH)
    .replace(/-$/, '');

/** The suffix keeps two people who roll the same star from colliding on the alias. */
export const randomWorkspaceIdentity = (
  random: () => number = Math.random,
): { name: string; alias: string } => {
  const celestial =
    CELESTIAL_NAMES[Math.floor(random() * CELESTIAL_NAMES.length)]!;
  let suffix = '';
  for (let i = 0; i < SUFFIX_LENGTH; i += 1) {
    suffix += SUFFIX_ALPHABET[Math.floor(random() * SUFFIX_ALPHABET.length)];
  }
  return { name: celestial.name, alias: `${celestial.alias}-${suffix}` };
};
