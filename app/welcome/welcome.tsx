import { Link } from "react-router";

export function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <img 
          src="/twixxer.svg" 
          alt="Twixxer Logo" 
          className="mx-auto h-24 w-auto"
        />
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Welcome to Twixxer
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Share your thoughts with the world
        </p>
        <div className="mt-8 space-y-3">
          <Link
            to="/signup"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign up
          </Link>
          <Link
            to="/login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}