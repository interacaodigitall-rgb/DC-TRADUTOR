import React, { useState } from 'react';

interface ApiKeyErrorProps {
  onApiKeySubmit: (key: string) => void;
  error: string;
}

const ApiKeyError: React.FC<ApiKeyErrorProps> = ({ onApiKeySubmit, error }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onApiKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="min-h-screen w-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
            <div className="max-w-xl w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Configuration Error</h1>
                <h2 className="text-lg text-gray-500 mb-6 text-center">Gemini API Key Not Found</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200/80">
                    <p className="text-gray-700 mb-4">
                        The application could not find the required API key in the Vercel environment variables.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="mb-6">
                        <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-700 mb-2">
                           To use the app now, please enter your key temporarily:
                        </label>
                        <div className="flex gap-2">
                             <input
                                id="apiKeyInput"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste your API key here"
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                aria-label="API Key Input"
                            />
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                                disabled={!apiKey.trim()}
                            >
                                Use Key
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This key is used for this session only and will not be stored.</p>
                    </form>

                    {error && !error.includes("not configured") && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm mb-4">
                           <strong>Error:</strong> {error}
                        </div>
                    )}
                    
                    <div className="text-sm text-gray-600 border-t pt-4">
                        <p className="font-semibold mb-2">For a permanent solution:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Go to your project on <strong>Vercel</strong>.</li>
                            <li>Navigate to <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
                            <li>Create a variable named <code className="bg-gray-200 p-1 rounded">API_KEY</code> and paste your key in the value field.</li>
                            <li>**Important:** Re-deploy the project to apply the changes.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyError;