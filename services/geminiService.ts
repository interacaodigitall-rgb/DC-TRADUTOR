import { GoogleGenAI, Modality } from "@google/genai";

// Lazily initialize the AI client to prevent app crash on load if API key is not set.
let ai: GoogleGenAI | null = null;

/**
 * Initializes or re-initializes the AI client with a specific API key.
 * This allows the user to provide a key at runtime if the environment variable is missing.
 * @param apiKey The API key to use for initialization.
 */
export function initializeAiClient(apiKey: string): void {
  if (!apiKey) {
    throw new Error("Provided API key is empty.");
  }
  ai = new GoogleGenAI({ apiKey });
}

/**
 * Gets the singleton instance of the GoogleGenAI client.
 * It first checks if the client is already initialized. If not, it tries
 * to initialize from environment variables.
 * @returns The initialized GoogleGenAI client.
 * @throws An error if the API key is not found in environment variables and the client hasn't been initialized manually.
 */
export function getAiClient(): GoogleGenAI {
  if (ai) {
    return ai;
  }

  // FIX: Check for both standard 'API_KEY' and user's 'CHAVE_API' for robustness.
  const apiKey = process.env.API_KEY || process.env.CHAVE_API;

  if (!apiKey) {
    // This error will be caught by the calling function's try...catch block in App.tsx.
    throw new Error("API_KEY environment variable is not configured for this deployment.");
  }
  
  initializeAiClient(apiKey);
  // The 'ai' variable is guaranteed to be non-null here.
  return ai!;
}


export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    const client = getAiClient();
    // FIX: Refactored to use systemInstruction for better prompting, per Gemini API guidelines.
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `"${text}"`,
      config: {
        systemInstruction: `You are a professional translator. Translate the provided text from ${sourceLang} to ${targetLang}, keeping the natural meaning.`,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error in translateText:", error);
    // Re-throw the original error to be handled by the caller, which can now provide more specific user feedback.
    throw error;
  }
}


export async function generateSpeech(text: string): Promise<string> {
    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }

        return base64Audio;
    } catch (error) {
        console.error("Error in generateSpeech:", error);
        // Re-throw the original error for the caller to handle.
        throw error;
    }
}