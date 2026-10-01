/** The Account authenticated in the current request. */
export type Actor = {
  readonly accountId: string;
  readonly email: string;
  /** As at sign-in; read anew wherever a current name is shown. */
  readonly name: string;
  /**
   * Read from the access token: being appointed or removed takes effect once
   * the token is refreshed. Never true for an external agent.
   */
  readonly isPlatformAdmin: boolean;
};
