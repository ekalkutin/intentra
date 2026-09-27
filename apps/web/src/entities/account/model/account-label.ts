type NamedAccount = {
  readonly email: string;
  readonly displayName: string | null;
};

/** The display name, or the email until one is set. */
export const accountLabel = (account: NamedAccount): string =>
  account.displayName ?? account.email;

export const accountInitial = (account: NamedAccount): string =>
  accountLabel(account).charAt(0).toUpperCase();
