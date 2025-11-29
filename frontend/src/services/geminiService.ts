
import { GoogleGenAI, Type } from "@google/genai";
import { DietaryPreference } from '../types';

// Safely initialize the AI client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes a meal description to automatically tag dietary attributes.
 */
export const analyzeMealDietaryTags = async (description: string): Promise<DietaryPreference[]> => {
  const ai = getAiClient();
  if (!ai) return [DietaryPreference.NONE];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this food description and identify all applicable dietary tags from this list: 
      [Vegetarian, Vegan, Hindu Veg (No Egg), Jain Veg (No Root Veg), Halal, Kosher, Gluten Free, Nut Free, No Oil].
      
      Description: "${description}"
      
      Return a JSON array of strings matching exactly the names provided in the list. If none apply, return empty array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const tags = JSON.parse(response.text || "[]");
    return tags as DietaryPreference[];
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return [];
  }
};

/**
 * Generates an encouraging message for a student.
 */
export const generateEncouragement = async (name: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Keep going! You are doing great.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a very short (max 20 words), warm, encouraging message for a student named ${name} who is studying hard away from home. Do not use hashtags.`,
    });
    return response.text.trim();
  } catch (error) {
    return "You've got this!";
  }
};

/**
 * Moderates content to ensure it's safe.
 */
export const moderateContent = async (text: string): Promise<boolean> => {
    const ai = getAiClient();
    if (!ai) return true; // Fail open if API key missing for demo

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Is the following text safe, appropriate, and non-offensive for a community food sharing portal? Reply with JSON boolean { "isSafe": boolean }. Text: "${text}"`,
            config: {
                responseMimeType: "application/json"
            }
        });
        const result = JSON.parse(response.text || "{}");
        return result.isSafe === true;
    } catch (e) {
        console.error("Moderation check failed", e);
        return true;
    }
}
