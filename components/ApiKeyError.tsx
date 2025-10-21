import React, { useState } from 'react';
import { submitApiKey } from '../services/geminiService';

interface ApiKeyErrorProps {
  onKeySubmit: () => void;
}

const ApiKeyError: React.FC<ApiKeyErrorProps> = ({ onKeySubmit }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!key.trim()) {
      setError('Please enter an API key.');
      return;
    }
    try {
      submitApiKey(key);
      onKeySubmit();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Submission failed: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200/80">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Ayla Tradutora</h1>
        <p className="text-center text-gray-500 mb-6">Please enter your Google Gemini API key to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your API Key"
            className="w-full bg-gray-100 border-transparent text-gray-700 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            aria-label="API Key Input"
          />
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Submit
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">
          You can get your API key from{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Google AI Studio
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyError;
