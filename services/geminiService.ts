import { GoogleGenAI, Modality } from "@google/genai";

// Lazily initialize the AI client to prevent app crash on load if API key is not set.
let ai: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  // FIX: Check for both standard 'API_KEY' and user's 'CHAVE_API' for robustness.
  const apiKey = process.env.API_KEY || process.env.CHAVE_API;

  if (!apiKey) {
    // This error will be caught by the calling function's try...catch block in App.tsx.
    throw new Error("API_KEY environment variable is not configured for this deployment.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: apiKey });
  }
  return ai;
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
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw error;
    }
    throw new Error("Failed to translate text with Gemini API.");
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
        if (error instanceof Error && error.message.includes("API_KEY")) {
            throw error;
        }
        throw new Error("Failed to generate speech with Gemini API.");
    }
}