import {Form, useActionData, useNavigate, useNavigation} from "react-router";
import { z } from "zod";
import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { v7 as uuidv7 } from 'uuid';
import { calculateTokenExpiry, generateVerificationToken, hashPassword } from "~/utils/auth";
import { sendVerificationEmail } from "~/utils/email";
import type { Route } from "./+types/signup";

const SignupSchema = z.object({
  name: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - Twixxer" },
    { name: "description", content: "Create your Twixxer account" },
  ];
}

export async function loader({params}: Route.LoaderArgs) {
  let username = params.username || "";
  // Check if the username already exists in the database
    const db = database();
    const existingUser = await db.query.profileTable.findFirst({
      where: (profile, { eq }) => {
        return eq(profile.profileUsername, username);
      }
    })

    if (existingUser) {
        return { error: "Username already exists. Please make a different Username." };
    }
    return { };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  };

  // Validate form data
  const result = SignupSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.format() };
  }

  // Hash the password using Argon2
  const passwordHash = await hashPassword(result.data.password);

  // Generate verification token and expiry time
  const verificationToken = generateVerificationToken();
  const tokenExpiry = calculateTokenExpiry(24); // 24 hours

  try {
    const db = database();

    // Create new profile with UUID
    await db.insert(schema.profileTable).values({
      profileId: uuidv7(),
      profileUsername: result.data.name,
      profileEmail: result.data.email,
      profilePasswordHash: passwordHash,
      profileActivationToken: verificationToken,
      profileVerified: false,
      profileTokenExpiry: tokenExpiry
    });

    // Send verification email
    await sendVerificationEmail(
        result.data.email,
        result.data.name,
        verificationToken
    );

    return {
      success: true,
      emailSent: true
    };
  } catch (error) {
    console.error("Error creating profile:", error);
    return {
      formError: "An error occurred while creating your account. The email might already be in use."
    };
  }
}

export default function SignUp({loaderData}: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const navigate = useNavigate();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    navigate(`/signup/${value}`);
  }


  return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Create Your Twixxer Account</h1>

        {actionData?.success && (
            <div className="mb-6 p-5 bg-green-100 text-green-800 rounded-md">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="font-semibold">Account Created Successfully!</span>
              </div>
              <p className="mb-3">We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.</p>
              <p className="text-sm">
                <strong>Note:</strong> If you don't see the email in your inbox, please check your spam folder. The verification link will expire in 24 hours.
              </p>
              <div className="mt-4 text-center">
                <a
                    href="/resend-verification"
                    className="text-blue-600 hover:text-blue-800 font-medium underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Didn't receive the email? Resend verification
                </a>
              </div>
            </div>
        )}

        {!actionData?.success && (
            <Form method="post" className="space-y-4">
              {actionData?.formError && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
                    {actionData.formError}
                  </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    onChange={handleUsernameChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {(actionData?.errors?.name?._errors ?? loaderData?.error) && (
                    <p className="text-red-500 text-xs mt-1">{actionData?.errors?.name?._errors?.[0] ?? loaderData?.error}</p>                )}
              </div>

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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {actionData?.errors?.password?._errors && (
                    <p className="text-red-500 text-xs mt-1">{actionData.errors.password._errors[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {actionData?.errors?.confirmPassword?._errors && (
                    <p className="text-red-500 text-xs mt-1">{actionData.errors.confirmPassword._errors[0]}</p>
                )}
              </div>

              <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </button>
              </div>
            </Form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Log in</a></p>
        </div>
      </div>
  );
}
