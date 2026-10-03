import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { Injectable } from '@nestjs/common';

/** What a person granted on the consent page, waiting for the client to fetch it. */
export type AuthorizationGrant = {
  readonly clientId: string;
  readonly redirectUri: string;
  /** PKCE S256 challenge. */
  readonly codeChallenge: string;
  /** The Personal Access Token created for the client. */
  readonly secret: string;
  /** ISO 8601, or null for a token that never expires. */
  readonly tokenExpiresAt: string | null;
};

type Pending = AuthorizationGrant & { readonly expiresAt: number };

const CODE_TTL_MS = 10 * 60 * 1000;

/**
 * Authorization codes live in memory for a few minutes and work once: the
 * API runs as a single instance, and a code lost on restart only means the
 * person authorizes again.
 */
@Injectable()
export class AuthorizationCodes {
  readonly #pending = new Map<string, Pending>();

  public issue(grant: AuthorizationGrant, now = Date.now()): string {
    this.#forgetExpired(now);
    const code = randomBytes(32).toString('base64url');
    this.#pending.set(code, { ...grant, expiresAt: now + CODE_TTL_MS });

    return code;
  }

  /** The grant, once, if the code is known, fresh and the verifier matches. */
  public redeem(
    code: string,
    codeVerifier: string,
    now = Date.now(),
  ): AuthorizationGrant | undefined {
    const pending = this.#pending.get(code);
    this.#pending.delete(code);
    if (!pending || pending.expiresAt <= now) {
      return undefined;
    }

    return matchesChallenge(codeVerifier, pending.codeChallenge)
      ? pending
      : undefined;
  }

  #forgetExpired(now: number): void {
    for (const [code, pending] of this.#pending) {
      if (pending.expiresAt <= now) {
        this.#pending.delete(code);
      }
    }
  }
}

function matchesChallenge(verifier: string, challenge: string): boolean {
  const computed = Buffer.from(
    createHash('sha256').update(verifier).digest('base64url'),
  );
  const expected = Buffer.from(challenge);

  return (
    computed.length === expected.length && timingSafeEqual(computed, expected)
  );
}
