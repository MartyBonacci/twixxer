import { Form, useActionData, useNavigation } from "react-router";
import { z } from "zod";
import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from "~/utils/auth";

// Since we don't have type generation yet
type RouteArgs = any;
type Route = {
  MetaArgs: RouteArgs;
  ActionArgs: RouteArgs;
  ComponentProps: RouteArgs;
};

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export function meta({}: Route["MetaArgs"]) {
  return [
    { title: "Sign Up - Twixxer" },
    { name: "description", content: "Create your Twixxer account" },
  ];
}

export async function action({ request }: Route["ActionArgs"]) {
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
  
  // Generate random activation token (32 chars for the DB field)
  const activationToken = randomBytes(16).toString('hex');

  try {
    const db = database();
    
    // Create new profile with UUID
    await db.insert(schema.profileTable).values({
      profileId: uuidv4(),
      profileName: result.data.name,
      profileEmail: result.data.email,
      profilePasswordHash: passwordHash,
      profileActivationToken: activationToken
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error creating profile:", error);
    return { 
      formError: "An error occurred while creating your account. The email might already be in use."
    };
  }
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Create Your Twixxer Account</h1>
      
      {actionData?.success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          <p>Account created successfully! Please check your email for activation.</p>
        </div>
      )}
      
      <Form method="post" className="space-y-4">
        {actionData?.formError && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
            {actionData.formError}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {actionData?.errors?.name?._errors && (
            <p className="text-red-500 text-xs mt-1">{actionData.errors.name._errors[0]}</p>
          )}
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
    </div>
  );
}
