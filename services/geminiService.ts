import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    // FIX: Refactored to use systemInstruction for better prompting, per Gemini API guidelines.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `"${text}"`,
      config: {
        systemInstruction: `You are a professional translator. Translate the provided text from ${sourceLang} to ${targetLang}, keeping the natural meaning.`,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error in translateText:", error);
    throw new Error("Failed to translate text with Gemini API.");
  }
}


export async function generateSpeech(text: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
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
        throw new Error("Failed to generate speech with Gemini API.");
    }
}