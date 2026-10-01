/** A Workspace's Provider Key as anyone may see it: never the key itself. */
export type ProviderKeyDto = {
  /** A piece of the key to recognise it by, such as `sk-or-v1-…x7Qa`. */
  readonly hint: string;
  readonly addedByMemberId: string;
  /** Null once the Member who added it has left the Workspace. */
  readonly addedByEmail: string | null;
  /** Null once the Member who added it has left the Workspace. */
  readonly addedByName: string | null;
  /** ISO 8601 */
  readonly addedAt: string;
};
