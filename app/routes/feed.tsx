import { useLoaderData, useActionData, redirect, useNavigation, useFetcher, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from "react-router";
import { useEffect, useRef, useState } from "react";
import { database } from "~/database/context";
import * as schema from "~/database/schema";
import { isAuthenticated, getUserFromSession } from "~/utils/auth";
import { desc } from "drizzle-orm";
import { z } from "zod";
import { v7 as uuidv7 } from 'uuid';
import { Chirp } from "~/components/Chirp";
import { ChirpForm } from "~/components/ChirpForm";

export function meta({}: Parameters<MetaFunction>[0]) {
  return [
    { title: "Feed - Twixxer" },
    { name: "description", content: "Your Twixxer feed" },
  ];
}

// Schema for validating chirp form data
const ChirpSchema = z.object({
  content: z.string()
    .min(1, "Chirp content is required")
    .max(280, "Chirp cannot exceed 280 characters")
});

export async function action({ request }: ActionFunctionArgs) {
  // Check if user is authenticated
  const isLoggedIn = await isAuthenticated(request);

  // If not authenticated, redirect to login page
  if (!isLoggedIn) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const data = {
    content: formData.get("content"),
  };

  // Validate form data
  const result = ChirpSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.format() };
  }

  try {
    const db = database();
    const user = await getUserFromSession(request);

    if (!user) {
      return { formError: "You must be logged in to create a chirp" };
    }

    // Generate a new chirp ID
    const chirpId = uuidv7();
    const chirpDate = new Date();

    // Insert new chirp into the database
    await db.insert(schema.chirpTable).values({
      chirpId,
      chirpProfileId: user.userId,
      chirpContent: result.data.content,
      chirpDate,
    });

    // Fetch the profile data needed for displaying the chirp
    const profile = await db.query.profileTable.findFirst({
      where: (profile, { eq }) => eq(profile.profileId, user.userId),
      columns: {
        profileUsername: true,
        profileImageUrl: true,
      },
    });

    // Create a new chirp object with the profile data
    const newChirp = {
      chirpId,
      chirpProfileId: user.userId,
      chirpContent: result.data.content,
      chirpDate,
      profile: {
        profileUsername: profile?.profileUsername || user.username,
        profileImageUrl: profile?.profileImageUrl,
      },
    };

    // Return the new chirp data and success flag
    return { 
      newChirp,
      success: true
    };
  } catch (error) {
    console.error("Error creating chirp:", error);
    return { formError: "An error occurred while creating your chirp. Please try again." };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is authenticated
  const isLoggedIn = await isAuthenticated(request);

  // If not authenticated, redirect to login page
  if (!isLoggedIn) {
    return redirect("/login");
  }

  // Check if there's a success parameter in the URL
  const url = new URL(request.url);
  const success = url.searchParams.get("success") === "true";

  // Get pagination parameters from URL
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  try {
    const db = database();
    const user = await getUserFromSession(request);

    // Fetch chirps from the database with pagination, ordered by date (newest first)
    const chirps = await db.query.chirpTable.findMany({
      orderBy: [desc(schema.chirpTable.chirpDate)],
      limit: limit,
      offset: offset,
      with: {
        profile: {
          columns: {
            profileUsername: true,
            profileImageUrl: true,
          },
        },
      },
    });

    // Fetch one more chirp to check if there are more chirps to load
    const nextChirps = await db.query.chirpTable.findMany({
      orderBy: [desc(schema.chirpTable.chirpDate)],
      limit: 1,
      offset: offset + limit,
    });

    const hasMore = nextChirps.length > 0;

    return {
      chirps,
      user,
      success,
      page,
      limit,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching chirps:", error);
    return {
      chirps: [],
      error: "Failed to load chirps. Please try again later."
    };
  }
}

export default function Feed() {
  const { chirps: initialChirps, user, error, success: loaderSuccess, page, hasMore } = useLoaderData<typeof loader>();
  const [allChirps, setAllChirps] = useState(initialChirps);
  const [currentPage, setCurrentPage] = useState(page);
  const [loadingMore, setLoadingMore] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);
  const [success, setSuccess] = useState(loaderSuccess);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher();

  const actionData = useActionData<typeof action>();

  // Load more chirps when fetcher returns data
  useEffect(() => {
    if (fetcher.data && fetcher.data.chirps) {
      setAllChirps(prev => [...prev, ...fetcher.data.chirps]);
      setCanLoadMore(fetcher.data.hasMore);
      setLoadingMore(false);
    }
  }, [fetcher.data]);

  // Handle new chirp from action data
  const handleChirpSuccess = (newChirp: any) => {
    // Add the new chirp to the beginning of the list
    setAllChirps(prev => [newChirp, ...prev]);
    // Set success message
    setSuccess(true);
  };

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && canLoadMore) {
          loadMoreChirps();
        }
      },
      { threshold: 0.5 }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current);
      }
    };
  }, [canLoadMore, loadingMore, currentPage]);

  // Function to load more chirps
  const loadMoreChirps = () => {
    if (loadingMore || !canLoadMore) return;

    setLoadingMore(true);
    const nextPage = (currentPage ?? 1) + 1;
    setCurrentPage(nextPage);

    fetcher.load(`/feed?page=${nextPage}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Chirp Feed</h1>

      {/* Success message from redirect */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md text-sm">
          Your chirp was posted successfully!
        </div>
      )}

      {/* Chirp Form */}
      <ChirpForm 
        actionData={actionData}
        onSuccess={handleChirpSuccess}
      />

      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {allChirps.length === 0 && !error ? (
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-300">No chirps yet. Be the first to chirp!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allChirps.map((chirp, index) => (
            <Chirp key={`${chirp.chirpId}${index}`} chirp={chirp} />
          ))}

          {/* Loading indicator and intersection observer reference */}
          <div ref={bottomRef} className="py-4 text-center">
            {loadingMore && (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            {!canLoadMore && allChirps.length > 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No more chirps to load</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
