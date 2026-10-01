/** An Account as a Platform Admin sees it. */
export type AccountDto = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly isPlatformAdmin: boolean;
  readonly isBlocked: boolean;
};
