import { useLoaderData, useActionData, Form, redirect, useNavigation, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from "react-router";
import { useState, useEffect } from "react";
import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { isAuthenticated, getUserFromSession } from "~/utils/auth";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { v7 as uuidv7 } from 'uuid';
import { Chirp } from "~/components/Chirp";

export function meta({ params }: Parameters<MetaFunction>[0]) {
  return [
    { title: `${params.username ? params.username + "'s Profile" : "Profile"} - Twixxer` },
    { name: "description", content: `${params.username ? params.username + "'s" : "User"} profile on Twixxer` },
  ];
}

// Schema for validating profile edit form data
const ProfileEditSchema = z.object({
  about: z.string().max(255, "About cannot exceed 255 characters").optional(),
  imageUrl: z.string().url("Please enter a valid URL").max(255, "URL cannot exceed 255 characters").optional().or(z.literal('')),
});

export async function action({ request, params }: ActionFunctionArgs) {
  // Check if user is authenticated
  const isLoggedIn = await isAuthenticated(request);

  // If not authenticated, redirect to login page
  if (!isLoggedIn) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const data = {
    about: formData.get("about") as string | null,
    imageUrl: formData.get("imageUrl") as string | null,
  };

  // Validate form data
  const result = ProfileEditSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.format() };
  }

  try {
    const db = database();
    const user = await getUserFromSession(request);

    if (!user) {
      return { formError: "You must be logged in to edit your profile" };
    }

    // Update profile in the database
    await db.update(schema.profileTable)
      .set({
        profileAbout: result.data.about || null,
        profileImageUrl: result.data.imageUrl || null,
      })
      .where(eq(schema.profileTable.profileId, user.userId));

    // Redirect to reload the page with updated profile data
    return redirect(`/profile/${user.username}?success=true`);
  } catch (error) {
    console.error("Error updating profile:", error);
    return { formError: "An error occurred while updating your profile. Please try again." };
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Get the username from the URL params
  const username = params.username;

  // Check if user is authenticated
  const isLoggedIn = await isAuthenticated(request);

  // If not authenticated, redirect to login page
  if (!isLoggedIn) {
    return redirect("/login");
  }

  // Check if there's a success parameter in the URL
  const url = new URL(request.url);
  const success = url.searchParams.get("success") === "true";

  try {
    const db = database();
    const currentUser = await getUserFromSession(request);

    if (!currentUser) {
      return redirect("/login");
    }

    // If no username is provided, redirect to the current user's profile
    if (!username) {
      return redirect(`/profile/${currentUser.username}`);
    }

    // Fetch the profile data for the requested username
    const profile = await db.query.profileTable.findFirst({
      where: (profile, { eq }) => eq(profile.profileUsername, username),
      columns: {
        profileId: true,
        profileUsername: true,
        profileEmail: true,
        profileAbout: true,
        profileImageUrl: true,
        profileVerified: true,
      },
    });

    // If profile not found, return a 404 error
    if (!profile) {
      return {
        error: "Profile not found",
        status: 404,
      };
    }

    // Fetch chirps from the database for this profile, ordered by date (newest first)
    const chirps = await db.query.chirpTable.findMany({
      where: (chirp, { eq }) => eq(chirp.chirpProfileId, profile.profileId),
      orderBy: [desc(schema.chirpTable.chirpDate)],
      with: {
        profile: {
          columns: {
            profileUsername: true,
            profileImageUrl: true,
          },
        },
      },
    });

    // Check if the current user is viewing their own profile
    const isOwnProfile = currentUser.userId === profile.profileId;

    return {
      profile,
      chirps,
      isOwnProfile,
      currentUser,
      success,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return {
      error: "Failed to load profile. Please try again later.",
      status: 500,
    };
  }
}

export default function Profile() {
  const { profile, chirps, isOwnProfile, error, success } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && 
                      navigation.formAction?.includes("/profile") && 
                      navigation.formMethod === "POST";

  // State for edit form
  const [about, setAbout] = useState(profile?.profileAbout || "");
  const [imageUrl, setImageUrl] = useState(profile?.profileImageUrl || "");

  // Update state when profile changes
  useEffect(() => {
    setAbout(profile?.profileAbout || "");
    setImageUrl(profile?.profileImageUrl || "");
  }, [profile?.profileAbout, profile?.profileImageUrl]);

  // If there's an error, display it
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-6 mb-6">
        <div className="flex items-center">
          <div className="mr-4">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={`${profile.profileUsername}'s avatar`}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-2xl">
                  {profile.profileUsername.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">{profile.profileUsername}</h1>
            {profile.profileAbout && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">{profile.profileAbout}</p>
            )}
          </div>
        </div>
      </div>

      {/* Success message from redirect */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md text-sm">
          Your profile was updated successfully!
        </div>
      )}

      {/* Profile Edit Form (only shown if viewing own profile) */}
      {isOwnProfile && (
        <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Edit Profile</h2>

          <Form method="post" className="space-y-4">
            {actionData?.formError && (
              <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
                {actionData.formError}
              </div>
            )}

            <div>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                About
              </label>
              <textarea
                id="about"
                name="about"
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Tell us about yourself"
                maxLength={255}
              ></textarea>
              {actionData?.errors?.about?._errors && (
                <p className="text-red-500 text-xs mt-1">{actionData.errors.about._errors[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profile Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://example.com/your-image.jpg"
              />
              {actionData?.errors?.imageUrl?._errors && (
                <p className="text-red-500 text-xs mt-1">{actionData.errors.imageUrl._errors[0]}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Chirps Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Chirps</h2>

        {chirps.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
            <p className="text-gray-600 dark:text-gray-300">No chirps yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chirps.map((chirp) => (
              <Chirp key={chirp.chirpId} chirp={chirp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
