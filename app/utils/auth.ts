import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

/**
 * Verifies a password against a hash using Argon2
 * 
 * @param password The plain text password to verify
 * @param hash The hashed password from the database
 * @returns A promise that resolves to a boolean indicating if the password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Hashes a password using Argon2
 * 
 * @param password The plain text password to hash
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id, // Balanced algorithm recommended for general password hashing
    memoryCost: 65536,     // 64 MiB memory usage
    timeCost: 3,           // Number of iterations
    parallelism: 4,        // Degree of parallelism
    salt: randomBytes(16)  // Generate a 16-byte salt
  });
}