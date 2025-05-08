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

/**
 * Generates a verification token for email verification
 * 
 * @returns A string token (32 characters hex)
 */
export function generateVerificationToken(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Calculates the expiry time for a verification token
 * 
 * @param hours Number of hours the token should be valid
 * @returns Date object representing the expiry time
 */
export function calculateTokenExpiry(hours: number = 24): Date {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
}

/**
 * Checks if a verification token is expired
 * 
 * @param expiryDate The expiry date of the token
 * @returns Boolean indicating if the token is expired
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}