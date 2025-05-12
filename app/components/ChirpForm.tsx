import { useState, useEffect, useRef } from "react";
import { Form, useNavigation } from "react-router";

// Define the type for the form errors
interface FormErrors {
  content?: {
    _errors: string[];
  };
}

// Define the type for the action data
interface ActionData {
  errors?: FormErrors;
  formError?: string;
  newChirp?: any;
  success?: boolean;
}

// Define the props for the ChirpForm component
interface ChirpFormProps {
  actionData?: ActionData;
  onSuccess: (newChirp: any) => void;
}

/**
 * ChirpForm component for creating new chirps
 */
export function ChirpForm({ actionData, onSuccess }: ChirpFormProps) {
  const [content, setContent] = useState("");
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const processedChirpRef = useRef<string | null>(null);
  const isSubmitting = navigation.state === "submitting" && 
                      navigation.formAction === "/feed" && 
                      navigation.formMethod === "POST";

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit form on Enter without Shift key
    if (e.key === "Enter" && !e.shiftKey && !isSubmitting) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // Handle form submission success
  useEffect(() => {
    if (actionData?.newChirp && actionData.newChirp.chirpId !== processedChirpRef.current) {
      processedChirpRef.current = actionData.newChirp.chirpId;
      onSuccess(actionData.newChirp);
      setContent("");
    }
  }, [actionData]);

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <Form ref={formRef} method="post" className="space-y-4">
        {actionData?.formError && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
            {actionData.formError}
          </div>
        )}

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What's happening?
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Share your thoughts..."
            maxLength={280}
          ></textarea>
          {actionData?.errors?.content?._errors && (
            <p className="text-red-500 text-xs mt-1">{actionData.errors.content._errors[0]}</p>
          )}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Max 280 characters
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Chirp"}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
