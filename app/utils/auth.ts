/**
 * Authentication Utilities Module
 * 
 * This module provides utilities for authentication and session management in the Twixxer application.
 * It handles session creation, user authentication, password hashing, and email verification.
 * 
 * Key features:
 * - Cookie-based session management
 * - Secure password hashing with Argon2
 * - User authentication and verification
 * - Account verification token generation
 */

import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { createCookieSessionStorage } from "react-router";

/**
 * Session Storage Configuration
 * 
 * Creates a cookie-based session storage with the following security settings:
 * - httpOnly: Prevents JavaScript access to the cookie
 * - sameSite: Restricts cookie sending to same-site requests (prevents CSRF)
 * - secure: Only sent over HTTPS in production 
 */
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__twixxer_session", // Unique name for the session cookie
    httpOnly: true,            // Prevents client-side JavaScript from accessing the cookie
    path: "/",                 // Cookie available across the entire domain
    sameSite: "lax",           // Cookie sent for same-site requests and top-level navigations
    secrets: [process.env.SESSION_SECRET || "s3cr3t-k3y-for-dev-only"], // Signing key
    secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
    maxAge: 60 * 60 * 24 * 7
  },
});

/**
 * Retrieves the session from a request
 * 
 * Extracts the cookie header from the request and uses it to retrieve the corresponding session.
 * 
 * @param request The HTTP request object
 * @returns The session object associated with the request's cookies
 */
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

/**
 * User session data structure
 * 
 * Contains the essential user information stored in the session:
 * - userId: Unique identifier for the user
 * - username: User's display name
 * - email: User's email address
 */
export interface UserSession {
  userId: string;
  username: string;
  email: string;
}

/**
 * Creates a new user session
 * 
 * Stores user information in the session and returns a response with the session cookie.
 * This function is called after successful authentication to establish the user's logged-in state.
 * 
 * @param request The request object
 * @param user The user data to store in the session
 * @param redirectTo Where to redirect after successful login (defaults to home page)
 * @returns Response with set-cookie header and redirect
 */
export async function createUserSession(
  request: Request,
  user: UserSession,
  redirectTo: string = "/"
) {
  const session = await getSession(request);
  
  // Store essential user data in the session
  session.set("userId", user.userId);
  session.set("username", user.username);
  session.set("email", user.email);

  // Return a redirect response with the session cookie
  return new Response(null, {
    status: 302, // HTTP status code for redirection
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7, // Session expires after 7 days
      }),
      Location: redirectTo, // Redirect URL
    },
  });
}

/**
 * Gets the current user from the session
 * 
 * Extracts user information from the session cookie if it exists.
 * Used to determine the currently logged-in user for authenticated routes.
 * 
 * @param request The request object
 * @returns The user session data or null if not logged in
 */
export async function getUserFromSession(request: Request): Promise<UserSession | null> {
  const session = await getSession(request);
  const userId = session.get("userId");
  const username = session.get("username");
  const email = session.get("email");

  // All required user session fields must be present
  if (!userId || !username || !email) return null;

  return {
    userId,
    username,
    email,
  };
}

/**
 * Checks if user is logged in
 * 
 * Utility function that determines if a valid user session exists.
 * Used for route protection and conditional UI rendering.
 * 
 * @param request The request object
 * @returns Boolean indicating if the user is logged in
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const user = await getUserFromSession(request);
  return user !== null;
}

/**
 * Logs out the user by destroying the session
 * 
 * Clears the user's session cookie, effectively ending their authenticated session.
 * Redirects to the home page after logout.
 * 
 * @param request The request object
 * @returns Response with set-cookie header that clears the session
 */
export async function logout(request: Request) {
  const session = await getSession(request);
  return new Response(null, {
    status: 302, // HTTP status code for redirection
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session), // Removes the session cookie
      Location: "/", // Redirect to home page
    },
  });
}

/**
 * Verifies a password against a hash using Argon2
 * 
 * Securely compares a plaintext password with its hashed version.
 * Uses the Argon2 password-hashing algorithm for secure verification.
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
    return false; // Return false on verification error (never expose errors to client)
  }
}

/**
 * Hashes a password using Argon2
 * 
 * Creates a secure hash of a plaintext password using the Argon2id algorithm.
 * Argon2id is recommended by OWASP and other security authorities for password storage.
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
    salt: randomBytes(16)  // Generate a 16-byte salt for additional security
  });
}

/**
 * Generates a verification token for email verification
 * 
 * Creates a cryptographically secure random token for verifying user emails.
 * Used in the account registration and email verification process.
 * 
 * @returns A string token (32 characters hex)
 */
export function generateVerificationToken(): string {
  return randomBytes(16).toString('hex'); // 16 bytes = 32 hex characters
}

/**
 * Calculates the expiry time for a verification token
 * 
 * Sets an expiration date for verification tokens to enhance security.
 * By default, tokens expire after 24 hours.
 * 
 * @param hours Number of hours the token should be valid (defaults to 24)
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
 * Compares the token's expiry date with the current time.
 * Used to invalidate old verification tokens for security.
 * 
 * @param expiryDate The expiry date of the token
 * @returns Boolean indicating if the token is expired
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true; // Treat null expiry as expired
  return new Date() > expiryDate; // Compare current time with expiry
}