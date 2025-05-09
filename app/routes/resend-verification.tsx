import { Form, useActionData, useNavigation } from "react-router";
import { z } from "zod";
import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { eq } from "drizzle-orm";
import { calculateTokenExpiry, generateVerificationToken } from "~/utils/auth";
import { sendVerificationEmail } from "~/utils/email";
import type { Route } from "./+types/resend-verification";

const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resend Verification Email - Twixxer" },
    { name: "description", content: "Resend your Twixxer verification email" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = {
    email: formData.get("email"),
  };

  // Validate form data
  const result = ResendVerificationSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.format() };
  }

  try {
    const db = database();

    // Find the profile with the given email
    const profiles = await db
      .select()
      .from(schema.profileTable)
      .where(eq(schema.profileTable.profileEmail, result.data.email));

    if (profiles.length === 0) {
      // Don't reveal if the email exists or not for security
      return { 
        success: true,
        message: "If your email is registered, a new verification link has been sent."
      };
    }

    const profile = profiles[0];

    // If the profile is already verified, no need to resend
    if (profile.profileVerified) {
      return { 
        success: true,
        message: "Your email is already verified. You can now log in."
      };
    }

    // Generate a new verification token and expiry
    const newToken = generateVerificationToken();
    const tokenExpiry = calculateTokenExpiry(24); // 24 hours

    // Update the profile with the new token and expiry
    await db
      .update(schema.profileTable)
      .set({ 
        profileActivationToken: newToken,
        profileTokenExpiry: tokenExpiry
      })
      .where(eq(schema.profileTable.profileId, profile.profileId));

    // Send the verification email
    await sendVerificationEmail(
      profile.profileEmail,
      profile.profileUsername,
      newToken
    );

    return { 
      success: true,
      message: "A new verification link has been sent to your email."
    };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return { 
      formError: "An error occurred while resending the verification email. Please try again later."
    };
  }
}

export default function ResendVerification() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Resend Verification Email</h1>

      {actionData?.success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          <p>{actionData.message}</p>
        </div>
      )}

      <Form method="post" className="space-y-4">
        {actionData?.formError && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
            {actionData.formError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {actionData?.errors?.email?._errors && (
            <p className="text-red-500 text-xs mt-1">{actionData.errors.email._errors[0]}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      </Form>
    </div>
  );
}
