import React from "react";
import { Link } from "react-router";

// Define the type for the chirp props
interface ChirpProps {
  chirp: {
    chirpId: string;
    chirpProfileId: string;
    chirpContent: string;
    chirpDate: Date | string;
    profile: {
      profileUsername: string;
      profileImageUrl: string | null;
    };
  };
}

/**
 * Chirp component displays a single chirp with user information
 */
export function Chirp({ chirp }: ChirpProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {chirp.profile.profileImageUrl ? (
            <img
              src={chirp.profile.profileImageUrl}
              alt={`${chirp.profile.profileUsername}'s avatar`}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-bold">
                {chirp.profile.profileUsername.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white mr-2">
              <Link 
                to={`/profile/${chirp.profile.profileUsername}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {chirp.profile.profileUsername}
              </Link>
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(chirp.chirpDate).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {chirp.chirpContent}
          </p>
        </div>
      </div>
    </div>
  );
}
