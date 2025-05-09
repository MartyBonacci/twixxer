import { useEffect, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { isTokenExpired } from "~/utils/auth";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/verify";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verify Email - Twixxer" },
    { name: "description", content: "Verify your Twixxer email address" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  // If no token is provided, redirect to homepage
  if (!token) {
    return { 
      status: "error", 
      message: "No verification token provided." 
    };
  }

  try {
    const db = database();

    // Find the profile with the given activation token
    const profiles = await db
      .select()
      .from(schema.profileTable)
      .where(eq(schema.profileTable.profileActivationToken, token));

    if (profiles.length === 0) {
      return { 
        status: "error", 
        message: "Invalid verification token." 
      };
    }

    const profile = profiles[0];

    // Check if the token is expired
    if (isTokenExpired(profile.profileTokenExpiry)) {
      return { 
        status: "expired", 
        message: "Verification link has expired. Please request a new one." 
      };
    }

    // Check if the profile is already verified
    if (profile.profileVerified) {
      return { 
        status: "verified", 
        message: "Your email is already verified. You can now log in." 
      };
    }

    // Verify the profile
    await db
      .update(schema.profileTable)
      .set({ 
        profileVerified: true,
        profileActivationToken: null,
        profileTokenExpiry: null
      })
      .where(eq(schema.profileTable.profileId, profile.profileId));

    return { 
      status: "success", 
      message: "Your email has been verified successfully! You can now log in." 
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { 
      status: "error", 
      message: "An error occurred while verifying your email. Please try again later." 
    };
  }
}

export default function VerifyEmail() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Animate the component in after mounting
    setAnimateIn(true);
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div 
        className={`transition-opacity duration-500 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
      >
        <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">Email Verification</h1>

        {data.status === "success" && (
          <div className="p-4 mb-4 bg-green-100 text-green-700 rounded-md">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-semibold">Success!</span>
            </div>
            <p>{data.message}</p>
            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log In
              </Link>
            </div>
          </div>
        )}

        {data.status === "verified" && (
          <div className="p-4 mb-4 bg-blue-100 text-blue-700 rounded-md">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-semibold">Already Verified</span>
            </div>
            <p>{data.message}</p>
            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log In
              </Link>
            </div>
          </div>
        )}

        {data.status === "expired" && (
          <div className="p-4 mb-4 bg-yellow-100 text-yellow-700 rounded-md">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-semibold">Link Expired</span>
            </div>
            <p>{data.message}</p>
            <div className="mt-4 text-center">
              <Link
                to="/resend-verification"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend Verification Email
              </Link>
            </div>
          </div>
        )}

        {data.status === "error" && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-semibold">Error</span>
            </div>
            <p>{data.message}</p>
            <div className="mt-4 text-center">
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Need help? <Link to="/contact" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Contact support</Link></p>
        </div>
      </div>
    </div>
  );
}
