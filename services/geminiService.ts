import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ReviewType } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development environments where the key might not be set.
  // In a real production environment, the key should be securely managed.
  console.warn("API_KEY is not set. Using a placeholder. The application might not function as expected.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    uiScore: { type: Type.NUMBER, description: "Overall UI score from 0 to 100." },
    uxScore: { type: Type.NUMBER, description: "Overall UX score from 0 to 100." },
    overallSummary: { type: Type.STRING, description: "A brief, two-sentence summary of the key findings." },
    uiAnalysis: {
      type: Type.ARRAY,
      description: "List of UI issues found.",
      items: {
        type: Type.OBJECT,
        properties: {
          issueTitle: { type: Type.STRING },
          issueDescription: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          severity: { type: Type.STRING, description: "Can be 'Critical', 'Major', or 'Minor'" },
        },
        required: ["issueTitle", "issueDescription", "recommendation", "severity"],
      },
    },
    uxAnalysis: {
      type: Type.ARRAY,
      description: "List of UX issues found based on established principles.",
      items: {
        type: Type.OBJECT,
        properties: {
          issueTitle: { type: Type.STRING },
          issueDescription: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          relevantLaw: { type: Type.STRING, description: "e.g., Hick's Law, Fitts's Law" },
          severity: { type: Type.STRING, description: "Can be 'Critical', 'Major', or 'Minor'" },
        },
        required: ["issueTitle", "issueDescription", "recommendation", "relevantLaw", "severity"],
      },
    },
  },
  required: ["uiScore", "uxScore", "overallSummary", "uiAnalysis", "uxAnalysis"],
};

const getReviewPrompt = (reviewType: ReviewType): string => {
  const basePrompt = `
    You are UXRay, a world-class AI assistant that reviews UI & UX design.
    Analyze the provided screenshot and generate a detailed report.
    Your tone should be professional, insightful, and helpful.
    Start with an overall summary.
    For each issue, provide a clear title, description, and a concrete, actionable recommendation.
    Assign a severity level ('Critical', 'Major', 'Minor') to each issue.
    Deduct points from a starting score of 100 for each issue to calculate the final UI and UX scores. Critical issues deduct more points than minor ones.
  `;

  const uiFocus = `
    Focus on the UI analysis. Check for:
    - Color palette and contrast.
    - Typography, font hierarchy, and readability.
    - Spacing, alignment, and layout consistency (grid system).
    - Visual hierarchy and element prominence.
    - Iconography and visual language consistency.
  `;

  const uxFocus = `
    Focus on the UX analysis. Check for:
    - Usability, clarity of calls-to-action, and affordances.
    - Information architecture and navigation flow.
    - Cognitive load and simplicity (Miller's Law).
    - Consistency and adherence to standards (Jakob's Law).
    - Choice paralysis (Hick's Law).
    - Target size and placement (Fitts’s Law).
    - Visual distinction of key elements (Von Restorff Effect).
    - Grouping of related items (Law of Proximity, Gestalt Principles).
  `;

  switch (reviewType) {
    case ReviewType.UI:
      return `${basePrompt}\n${uiFocus}\nProvide an empty array for the uxAnalysis.`;
    case ReviewType.UX:
      return `${basePrompt}\n${uxFocus}\nProvide an empty array for the uiAnalysis.`;
    default:
      return basePrompt;
  }
};

export const analyzeDesign = async (
  image: { data: string; mimeType: string },
  reviewType: ReviewType
): Promise<AnalysisResult> => {
  const prompt = getReviewPrompt(reviewType);

  const imagePart = {
    inlineData: {
      data: image.data.split(',')[1],
      mimeType: image.mimeType,
    },
  };

  const textPart = {
    text: prompt,
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

    const jsonString = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonString);
    
    // Ensure scores are within bounds
    result.uiScore = Math.max(0, Math.min(100, result.uiScore));
    result.uxScore = Math.max(0, Math.min(100, result.uxScore));
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from AI. The response might be malformed or the API call failed.");
  }
};