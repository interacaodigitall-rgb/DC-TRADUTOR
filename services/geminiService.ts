import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

/**
 * Gets the singleton instance of the GoogleGenAI client.
 * Initializes the client using the API_KEY from environment variables if not already done.
 * @returns The initialized GoogleGenAI client.
 * @throws An error if the API_KEY environment variable is not configured.
 */
export function getAiClient(): GoogleGenAI {
  if (!ai) {
    // The API key must be available as an environment variable.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set. Please configure it in your deployment environment.");
    }
    ai = new GoogleGenAI({ apiKey });
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
    
    const systemInstruction = sourceLang === 'Auto Detect'
        ? `You are a professional translator. First, automatically detect the language of the provided text. Then, translate it to ${targetLang}, keeping the natural meaning.`
        : `You are a professional translator. Translate the provided text from ${sourceLang} to ${targetLang}, keeping the natural meaning.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `"${text}"`,
      config: {
        systemInstruction: systemInstruction,
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