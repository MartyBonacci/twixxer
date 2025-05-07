import { Link } from "react-router";

export function Welcome({
  message
}: {
  message: string;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Happening now
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8">
                Join Twixxer today.
              </h2>
              <div className="space-y-4 max-w-md">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Connect with friends, share your thoughts, and stay updated with what's happening in the world.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link
                    to="/signup"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full text-center transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 font-bold py-3 px-6 rounded-full text-center transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 max-w-md w-full">
                <div className="flex justify-center mb-6">
                  <img 
                    src="/twixxer.svg" 
                    alt="Twixxer Logo" 
                    className="h-12 w-auto"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                  See what's happening in the world right now
                </h3>
                <div className="space-y-4 mt-6">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      "Just launched our new product! #excited"
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      @techFounder - 5m ago
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      "The sunrise this morning was absolutely breathtaking! 🌅"
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      @naturePhotographer - 20m ago
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      "Just finished reading an amazing book. Highly recommend! 📚"
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      @bookworm - 1h ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Twixxer. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                About
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Terms
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}