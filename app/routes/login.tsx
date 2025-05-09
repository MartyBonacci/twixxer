import { Form, useActionData, useNavigation, redirect } from "react-router";
import { z } from "zod";
import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { verifyPassword, createUserSession } from "~/utils/auth";
import type { Route } from "./+types/login";
import { eq, or } from "drizzle-orm";

// Since we don't have type generation yet

const LoginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  redirectTo: z.string().default("/")
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Log In - Twixxer" },
    { name: "description", content: "Log in to your Twixxer account" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = {
    emailOrUsername: formData.get("emailOrUsername"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") || "/"
  };

  // Validate form data
  const result = LoginSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.format() };
  }

  try {
    const db = database();
    const emailOrUsername = result.data.emailOrUsername;

    // Find user by email or username
    const user = await db.query.profileTable.findFirst({
      where: (profile, { eq, or }) => {
        return or(
          eq(profile.profileEmail, emailOrUsername),
          eq(profile.profileUsername, emailOrUsername)
        );
      }
    });

    // If user not found or password doesn't match
    if (!user) {
      return {
        formError: "Invalid username/email or password"
      };
    }

    // Check if the account is verified
    if (!user.profileVerified) {
      return {
        verificationNeeded: true,
        email: user.profileEmail
      };
    }

    // Verify password
    const passwordValid = await verifyPassword(result.data.password, user.profilePasswordHash);

    if (!passwordValid) {
      return {
        formError: "Invalid username/email or password"
      };
    }

    // Create user session and redirect
    return createUserSession(
      request,
      {
        userId: user.profileId,
        username: user.profileUsername,
        email: user.profileEmail
      },
      result.data.redirectTo as string
    );
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      formError: "An error occurred while logging in. Please try again."
    };
  }
}

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Log in to Twixxer</h1>

      {actionData?.success ? (
        <div className="mb-6 p-5 bg-green-100 text-green-800 rounded-md">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-semibold">Login Successful!</span>
          </div>
          <p className="mb-3">You are now logged in to your account.</p>
          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Go to Home
            </a>
          </div>
        </div>
      ) : (
        <Form method="post" className="space-y-4">
          {actionData?.formError && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
              {actionData.formError}
            </div>
          )}

          {actionData?.verificationNeeded && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md text-sm">
              <p className="mb-2">Your account has not been verified yet. Please check your email for the verification link.</p>
              <a
                href={`/resend-verification?email=${encodeURIComponent(actionData.email)}`}
                className="text-blue-600 hover:text-blue-800 font-medium underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Resend verification email
              </a>
            </div>
          )}

          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email or Username
            </label>
            <input
              id="emailOrUsername"
              name="emailOrUsername"
              type="text"
              autoComplete="username"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Email or Username"
            />
            {actionData?.errors?.emailOrUsername?._errors && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.emailOrUsername._errors[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {actionData?.errors?.password?._errors && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.password._errors[0]}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </div>
        </Form>
      )}

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Don't have an account? <a href="/signup" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Sign up</a></p>
      </div>
    </div>
  );
}