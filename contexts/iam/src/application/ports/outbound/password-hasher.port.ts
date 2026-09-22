export abstract class PasswordHasher {
  abstract hash(password: string): string;
  abstract compare(password: string, storedHash: string): boolean;
}
