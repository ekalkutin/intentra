import { User } from './user.js';

/** The application seam for looking up users. */
export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
}
