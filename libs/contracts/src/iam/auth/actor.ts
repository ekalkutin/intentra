/** The Account authenticated in the current request. */
export type Actor = {
  readonly accountId: string;
  readonly email: string;
  /**
   * Read from the access token: being appointed or removed takes effect once
   * the token is refreshed. Never true for an external agent.
   */
  readonly isPlatformAdmin: boolean;
};
