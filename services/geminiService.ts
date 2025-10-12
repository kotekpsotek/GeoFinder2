import { GoogleGenAI, Type } from "@google/genai";
import { type AnalysisResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        locationFound: { 
            type: Type.BOOLEAN,
            description: "Set to true if a specific location is identified, otherwise false."
        },
        location: {
            type: Type.OBJECT,
            description: "Object containing location details. Only present if locationFound is true.",
            properties: {
                latitude: { 
                    type: Type.NUMBER,
                    description: "The latitude of the location."
                },
                longitude: { 
                    type: Type.NUMBER,
                    description: "The longitude of the location."
                },
                placeName: { 
                    type: Type.STRING,
                    description: "The common name of the location (e.g., city, landmark)."
                },
                description: {
                    type: Type.STRING,
                    description: "A brief explanation of how the location was identified from the image."
                }
            }
        },
        reason: { 
            type: Type.STRING,
            description: "Explanation for why a location could not be identified. Only present if locationFound is false."
        }
    },
    required: ["locationFound"]
};

export async function analyzeImageLocation(
  base64Image: string,
  mimeType: string
): Promise<AnalysisResponse> {
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const textPart = {
    text: `You are a world-class geo-location expert. Your task is to analyze this image and identify the specific geographical location where it was taken with the highest possible accuracy.

Scrutinize the image for any identifying clues, including but not limited to:
- **Architectural Styles:** Are the buildings of a specific regional or historical style?
- **Landmarks:** Are there any recognizable buildings, monuments, bridges, or statues?
- **Natural Features:** Look for distinctive mountains, coastlines, rivers, or geological formations.
- **Flora and Fauna:** Can you identify plant or animal species native to a particular region?
- **Signage and Text:** Analyze any visible text on signs, banners, or vehicles. Note the language and style.
- **Climate and Environment:** Observe the weather, light quality, and overall environment for clues about the latitude and climate.
- **Cultural Clues:** Look for flags, clothing styles, or cultural objects that might indicate a location.

If you can identify a plausible, specific location, provide its details. Your reasoning in the 'description' field should be detailed, explaining exactly which clues you used to arrive at your conclusion.

If the image is too generic (e.g., an indoor photo with no identifiable features, a non-descript landscape) and a specific location cannot be confidently determined, state that clearly in the 'reason' field.

Return your findings in the specified JSON format.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse: AnalysisResponse = JSON.parse(jsonText);
    
    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
}