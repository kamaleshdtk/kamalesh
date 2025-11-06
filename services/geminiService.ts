
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ReviewType } from '../types';

const issueSchema = {
    type: Type.OBJECT,
    properties: {
        issueTitle: { type: Type.STRING },
        issueDescription: { type: Type.STRING },
        recommendation: { type: Type.STRING },
        severity: { type: Type.STRING, description: "Can be 'Critical', 'Major', or 'Minor'" },
    },
    required: ["issueTitle", "issueDescription", "recommendation", "severity"],
};

const uxIssueSchema = {
    ...issueSchema,
    properties: {
        ...issueSchema.properties,
        relevantLaw: { type: Type.STRING, description: "e.g., Hick's Law, Fitts's Law" },
    },
    // relevantLaw is not always required, so keeping the base required fields.
};

const categoryAnalysisSchema = (issueTypeSchema: any) => ({
    type: Type.OBJECT,
    properties: {
        categoryName: { type: Type.STRING, description: "The name of the checklist category being analyzed (e.g., 'Layout & Structure')." },
        categoryScore: { type: Type.NUMBER, description: "The score for this specific category from 0 to 100." },
        issues: {
            type: Type.ARRAY,
            description: "A list of issues found within this category.",
            items: issueTypeSchema,
        },
    },
    required: ["categoryName", "categoryScore", "issues"],
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    uiScore: { type: Type.NUMBER, description: "Overall UI score from 0 to 100, calculated as the average of all UI category scores." },
    uxScore: { type: Type.NUMBER, description: "Overall UX score from 0 to 100, calculated as the average of all UX category scores." },
    overallSummary: { type: Type.STRING, description: "A brief, two-sentence summary of the key findings." },
    uiCategoryAnalyses: {
      type: Type.ARRAY,
      description: "A detailed breakdown of the UI analysis by category.",
      items: categoryAnalysisSchema(issueSchema),
    },
    uxCategoryAnalyses: {
      type: Type.ARRAY,
      description: "A detailed breakdown of the UX analysis by category.",
      items: categoryAnalysisSchema(uxIssueSchema),
    },
  },
  required: ["uiScore", "uxScore", "overallSummary", "uiCategoryAnalyses", "uxCategoryAnalyses"],
};


const getReviewPrompt = (reviewType: ReviewType): string => {
  const basePrompt = `
    You are UXRay, a world-class AI assistant specializing in UI & UX design analysis.
    Your task is to analyze the provided screenshot and generate a detailed, structured report based on the checklists below.
    Your tone must be professional, insightful, and helpful.

    **CRITICAL INSTRUCTION: You MUST be deterministic. For the exact same input image, you MUST produce the exact same JSON output, including scores and descriptions. Do not introduce any randomness.**

    **Report Structure and Scoring Rules:**
    1.  **Categorical Analysis:** Analyze the design against EACH category in the provided checklist (e.g., "Layout & Structure", "Color & Contrast").
    2.  **Category Score:** For each category, assign a score from 0 to 100. Start at 100 and deduct points for any issues found within that category. The more severe the issue, the more points you deduct.
    3.  **Issue Identification:** Within each category, list all specific issues you find. For each issue, you MUST provide:
        - A clear \`issueTitle\`.
        - A detailed \`issueDescription\`.
        - A concrete, actionable \`recommendation\`.
        - A \`severity\` level ('Critical', 'Major', 'Minor').
        - For UX issues, if applicable, also provide the \`relevantLaw\` (e.g., "Hick's Law").
    4.  **Overall Score:** Calculate the final overall \`uiScore\` and \`uxScore\` by taking the mathematical AVERAGE of all their respective category scores. For example, if there are 8 UI categories, the \`uiScore\` is the sum of the 8 category scores divided by 8. Round the final score to the nearest whole number.
    5.  **Summary:** Start the entire report with a brief, two-sentence \`overallSummary\` of the key findings.
    6.  **Empty Categories:** If a category has no issues, give it a score of 100 and an empty \`issues\` array.
    7.  **Focused Review:** If you are asked to focus on only UI or only UX, the other category's analysis array should be empty, and its overall score should be 100.
  `;

  const uiFocus = `
    ## UI (User Interface) Analysis Checklist (Visual + Presentation Layer)
    
    ### 1. Layout & Structure
    - **Alignment & Spacing:** Check for consistent alignment, spacing, and grid use.
    - **Visual Hierarchy:** Ensure important elements stand out.
    - **Grouping:** Logically group related elements.
    - **Margins & Padding:** Verify consistent spacing between sections.

    ### 2. Color & Contrast
    - **Contrast:** Ensure text-to-background contrast is WCAG-compliant.
    - **Palette Consistency:** Check for consistent and meaningful use of the color palette.
    - **Accessibility:** Consider color blindness.

    ### 3. Typography
    - **Consistency:** Use a maximum of 2-3 font families.
    - **Readability:** Body text should be at least 16px. Check line height and spacing.
    - **Hierarchy:** Ensure a clear heading structure (H1-H6).
    - **Overflow:** Check for truncated or overflowing text.

    ### 4. Visual Consistency
    - **Style System:** Buttons, cards, and modals should follow a consistent style.
    - **Element Style:** Border radius, shadows, and icon styles should be consistent.

    ### 5. Imagery & Illustration
    - **Quality:** Images should have proper resolution and aspect ratio, with no pixelation.
    - **Consistency:** Illustrations should share a consistent style.
    - **Relevance:** Images should support the content, not just be decorative.

    ### 6. Feedback & States
    - **Element States:** All interactive elements must have hover, active, disabled, and focus states.
    - **Feedback:** Loading indicators, and clear error/success messages must be present.

    ### 7. Branding
    - **Logo & Identity:** Logo placement should be consistent (typically top-left). Colors and tone must match the brand identity.

    ### 8. Responsive & Device Adaptation
    - **Layout:** The layout must adapt correctly to mobile, tablet, and desktop without horizontal scrolling.
    - **Scaling:** Buttons and text should scale properly on smaller screens.
  `;

  const uxFocus = `
    ## UX (User Experience) Analysis Checklist (Usability + Flow Layer)

    ### 1. Information Architecture
    - **Navigation:** It should be clear, predictable, and minimal.
    - **Grouping:** Pages and features should be grouped logically.
    - **Awareness:** Use breadcrumbs or other indicators to show the user's location.

    ### 2. User Flow & Journey
    - **Task Efficiency:** Key tasks (like signing up) should be smooth with minimal clicks.
    - **Feedback:** Provide feedback after every major user action.
    - **Dead Ends:** Avoid dead ends; always provide a next step or a way back.

    ### 3. Accessibility
    - **Keyboard Navigation:** The entire interface must be navigable by keyboard.
    - **Screen Readers:** Use ARIA labels where necessary.
    - **Touch Targets:** Ensure touch targets are at least 44x44px.

    ### 4. Readability & Clarity
    - **Copywriting:** The tone should match the audience. Avoid jargon.
    - **CTAs:** Calls-to-action should be clear and descriptive (e.g., "Get Started" is better than "Submit").

    ### 5. Error Prevention & Recovery
    - **Validation:** Use inline validation for forms.
    - **Error Messages:** Messages should be descriptive, not generic.
    - **Recovery:** Provide "undo" or confirmation for destructive actions.

    ### 6. Performance Perception
    - **Speed:** The app should feel fast (load under 3s). Use skeleton screens or loaders.
    - **Layout Shift:** Avoid Cumulative Layout Shift (CLS) issues.

    ### 7. Delight & Emotion
    - **Microinteractions:** Use subtle animations for feedback.
    - **Empty States:** Empty states should be pleasant and encouraging.
    - **Personalization:** Recognize the user (e.g., use their name).

    ### 8. Trust & Credibility
    - **Security:** Use secure UX patterns (HTTPS, visible auth states).
    - **Transparency:** Be clear about pricing and policies.
  `;

  switch (reviewType) {
    case ReviewType.UI:
      return `${basePrompt}\nFocus your analysis ONLY on the UI checklist and its categories. Populate the \`uiCategoryAnalyses\` array. Provide an empty array for \`uxCategoryAnalyses\` and set \`uxScore\` to 100.\n${uiFocus}`;
    case ReviewType.UX:
      return `${basePrompt}\nFocus your analysis ONLY on the UX checklist and its categories. Populate the \`uxCategoryAnalyses\` array. Provide an empty array for \`uiCategoryAnalyses\` and set \`uiScore\` to 100.\n${uxFocus}`;
    default:
      return basePrompt;
  }
};

export const analyzeDesign = async (
  image: { data: string; mimeType: string },
  reviewType: ReviewType
): Promise<AnalysisResult> => {
  // Safely access the API key and initialize the client inside the function
  // to prevent an app-level crash if `process` is not defined on load.
  const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

  if (!API_KEY) {
    console.error("Gemini API key is not configured in the environment.");
    throw new Error("The AI service is not configured. Please contact support.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
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
        temperature: 0, // Set temperature to 0 for maximum determinism and consistency.
      },
    });

    const jsonString = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonString);
    
    // Ensure scores are within bounds
    result.uiScore = Math.max(0, Math.min(100, Math.round(result.uiScore)));
    result.uxScore = Math.max(0, Math.min(100, Math.round(result.uxScore)));
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from AI. The response might be malformed or the API call failed.");
  }
};
