/** Encrypts secrets at rest and gives them back when they are used. */
export abstract class SecretCipher {
  abstract encrypt(plaintext: string): string;
  abstract decrypt(ciphertext: string): string;
}
