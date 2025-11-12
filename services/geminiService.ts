import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ReviewType, GuidelinePreset } from '../types';

const issueSchema = {
    type: Type.OBJECT,
    properties: {
        issueTitle: { type: Type.STRING },
        issueDescription: { type: Type.STRING },
        recommendation: { type: Type.STRING },
        severity: { type: Type.STRING, description: "Can be 'Critical', 'Major', or 'Minor'" },
        relevantLaw: { type: Type.STRING, description: "e.g., Hick's Law, Fitts's Law. Include if a UX law is directly relevant to the issue." },
    },
    required: ["issueTitle", "issueDescription", "recommendation", "severity"],
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
    isCaptcha: { type: Type.BOOLEAN, description: "True if the image is a CAPTCHA/bot check, otherwise false." },
    isAccessDenied: { type: Type.BOOLEAN, description: "True if the image is an access denied/permission error page, otherwise false." },
    isErrorPage: { type: Type.BOOLEAN, description: "True if the image is a generic web error page (e.g., 404 Not Found), otherwise false." },
    isNotUiScreenshot: { type: Type.BOOLEAN, description: "True if the image is NOT a screenshot of a website, app, or UI mockup, but something else like a photo of nature." },
    isFullPage: { type: Type.BOOLEAN, description: "True if the screenshot appears to be a full page (header to footer), false if it's a partial view." },
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
      items: categoryAnalysisSchema(issueSchema), // Simplified to use the same enhanced schema
    },
  },
  required: ["isCaptcha", "isAccessDenied", "isErrorPage", "isNotUiScreenshot", "isFullPage", "uiScore", "uxScore", "overallSummary", "uiCategoryAnalyses", "uxCategoryAnalyses"],
};


const getReviewPrompt = (reviewType: ReviewType, guideline: GuidelinePreset): string => {
  let guidelineInstruction = '';
  if (guideline && guideline !== 'General') {
    guidelineInstruction = `
      **Additional Guideline Constraint:**
      In addition to the checklists, you MUST perform your analysis through the specific lens of the **${guideline}** design system.
      - For each issue you identify, explicitly mention how it violates a principle from ${guideline}.
      - If an element conforms well to ${guideline}, you can mention it, but focus on finding violations.
      - Your recommendations should suggest solutions that align with ${guideline}'s components and patterns (e.g., 'Use a Material Design Floating Action Button').
    `;
  }

  const basePrompt = `
    You are a free, hobby-level AI assistant. Your goal is to provide a helpful and encouraging design audit for hobbyists and students, using state-of-the-art, freely available models. Your tone should be friendly and constructive. Before you begin, you must perform four critical safety checks in order.

    **Step 1: CAPTCHA Verification**

    This is your most important step. A mistake here is a critical failure. Your task is to determine if the provided image is *only* a security check designed to block bots.

    - **Definition of a CAPTCHA (Set \`isCaptcha: true\`):**
        - **Image Puzzles:** A grid of images asking to "select all squares with cars".
        - **Distorted Text:** Warped or obscured text/numbers that a user must type.
        - **Security Checkboxes:** A checkbox from services like reCAPTCHA, hCaptcha, or Cloudflare explicitly stating "I'm not a robot" or "Verify you are human".
        - **Interactive Puzzles:** "Slide to verify" or similar puzzles.

    - **Definition of NOT a CAPTCHA (Set \`isCaptcha: false\`):**
        - **User Authentication:** Login forms, sign-up pages, password fields.
        - **Consent & Banners:** Cookie consent pop-ups, privacy notices (GDPR/CCPA).
        - **ANYTHING ELSE:** If it's a normal part of a website's user interface, it is NOT a CAPTCHA.
    
    - **Your Action for Step 1:**
        - If the image matches the CAPTCHA definition, set \`isCaptcha: true\` and STOP. Provide empty/default values for all other fields.
        - If not, set \`isCaptcha: false\` and proceed to Step 2.
        - **You will be heavily penalized for misclassifying a normal webpage (like a login screen) as a CAPTCHA.**

    **Step 2: Access Denied Verification**

    After confirming the image is not a CAPTCHA, check if it's a generic SERVER-LEVEL error page that indicates the screenshot service itself was blocked.

    - **Definition of an Access Denied Page (Set \`isAccessDenied: true\`):**
        - **Plain, unstyled pages** from a server or CDN (like Cloudflare, Akamai, AWS).
        - **Explicit error codes:** "Access Denied", "Forbidden", "403 Error", "You don't have permission to access this server".
        - The key indicator is that the page lacks any of the website's normal branding, navigation, or styling. It looks like a raw error message.

    - **Definition of NOT an Access Denied Page (Set \`isAccessDenied: false\`):**
        - **User Authentication Screens:** This is critical. Login forms, sign-up pages, and password fields are part of the application, not a server block. Do not classify these as access denied.
        - **Styled 404 Pages:** A website's custom "Page Not Found" page (this will be handled in the next step).
        - **Paywalls:** Pages asking the user to subscribe to see the article.
        - **In-app Permission Messages:** A message within the website's normal layout that says "Your plan doesn't include this feature."
        - Any page that contains the website's regular header, footer, or branding is NOT a server-level access denied page.

    - **Your Action for Step 2:**
        - If the image matches the strict Access Denied definition, set \`isAccessDenied: true\` and STOP. Provide empty/default values for all other fields.
        - If not, set \`isAccessDenied: false\` and proceed to the next step.

    **Step 3: Web Error Page Verification**

    After confirming it's not a CAPTCHA or Access Denied page, check if it's a generic WEB-APPLICATION error page.

    - **Definition of an Error Page (Set \`isErrorPage: true\`):**
        - **The entire page's primary purpose must be to communicate a critical failure.**
        - **Styled 404 Pages:** A website's custom-branded "Page Not Found", "404 Error".
        - **Server Error Pages:** "500 Internal Server Error", "503 Service Unavailable".
        - **Connection Errors:** "This site can’t be reached", "Unable to connect".
        
    - **Definition of NOT an Error Page (Set \`isErrorPage: false\`):**
        - **A page is NOT an error page if it is a functioning part of the user journey, even if it contains negative feedback.**
        - **User Authentication:** Login pages, sign-up forms, password reset screens.
        - **Form Validation:** A form showing an inline error like "This field is required" or "Invalid email".
        - **Empty States:** A page showing "You have no messages", "Your cart is empty", or "No search results found".
        - **Gated Content:** Paywalls, subscription pages, cookie consent banners.
        - **Success/Confirmation Messages:** "Your order is complete".
        - Any page that contains the website's regular navigation, header, or footer and is presenting application state is NOT a generic web error page.

    - **Your Action for Step 3:**
        - If the image matches the Error Page definition, set \`isErrorPage: true\` and STOP. Provide empty/default values for all other fields.
        - If not, set \`isErrorPage: false\` and proceed to the next step.
        
    **Step 4: UI Content & Scope Verification**

    Your final verification step is to confirm the image content is a valid UI and determine its scope.

    - **Part A: UI Content Validation**
        - **Definition of a VALID UI Screenshot (Set \`isNotUiScreenshot: false\`):**
            - The image is a clear screenshot of an entire website, a web application, a mobile application screen, or a detailed UI mockup. It must represent a complete user-facing interface.
        - **Definition of an INVALID UI Screenshot (Set \`isNotUiScreenshot: true\`):**
            - **Photographs:** The image is a photograph of a real-world scene (e.g., nature, people, animals).
            - **Creative Assets:** The image is primarily a creative asset and not an interactive interface. This includes:
                - Promotional posters or flyers.
                - Creative ad banners or ad copy.
                - Individual social media posts (e.g., a single Tweet or Instagram post).
                - Any other design that is primarily for marketing or content consumption rather than user interaction within a larger application context.
            - It is any other image that does not depict a software interface.
        - **Action:** If the image is INVALID, set \`isNotUiScreenshot: true\` and STOP. Provide default/empty values for all other fields. Otherwise, set \`isNotUiScreenshot: false\` and proceed to Part B.

    - **Part B: Scope Analysis (Only if it's a valid UI)**
        - **Task:** Determine if the screenshot represents a full page from top to bottom.
        - **Definition of a Full Page (Set \`isFullPage: true\`):**
            - The screenshot clearly contains both a main header section (with elements like logo, main navigation) at the top AND a main footer section (with elements like copyright info, contact links, sitemap) at the bottom. The content between them should appear complete.
        - **Definition of a Partial Page (Set \`isFullPage: false\`):**
            - The screenshot is missing either a clear header or a clear footer (or both).
            - It's a close-up of a specific component.
            - It's an "above-the-fold" view where the footer is not visible.
        - **Action:** Set the \`isFullPage\` boolean accordingly.

    **Step 5: Full Design Analysis**
    
    If, and only if, you have determined the image is NOT a CAPTCHA, NOT an Access Denied page, NOT an Error Page, and IS a UI Screenshot, proceed with the following instructions.
    Your task is to conduct a friendly, professional audit of the provided screenshot. Provide helpful tips and nice suggestions. Be constructive and objective, identifying potential improvements based on established design principles from the checklists below.
    Your tone should be friendly and encouraging, suitable for a hobbyist.

    ${guidelineInstruction}

    **CRITICAL INSTRUCTION: You MUST be deterministic. For the exact same input image, you MUST produce the exact same JSON output, including scores and descriptions. Do not introduce any randomness.**

    **Report Structure and Scoring Rules:**
    1.  **Categorical Analysis:** Analyze the design against EACH category in the provided checklist (e.g., "Layout & Structure", "Color & Contrast").
    2.  **Category Score:** For each category, assign a score from 0 to 100. Start at 100 and deduct points for any issues found within that category. The more severe the issue, the more points you deduct.
    3.  **Issue Identification:** Within each category, list all specific issues you find. For each issue, you MUST provide:
        - A clear \`issueTitle\`.
        - A detailed \`issueDescription\`.
        - A concrete, actionable \`recommendation\`.
        - A \`severity\` level ('Critical', 'Major', 'Minor').
        - If applicable, also provide the \`relevantLaw\` (e.g., "Hick's Law").
    4.  **Overall Score:** Calculate the final overall \`uiScore\` and \`uxScore\` by taking the mathematical AVERAGE of all their respective category scores. For example, if there are 8 UI categories, the \`uiScore\` is the sum of the 8 category scores divided by 8. Round the final score to the nearest whole number.
    5.  **Summary:** Start the entire report with a brief, two-sentence \`overallSummary\` of the key findings.
    6.  **Empty Categories:** If a category has no issues, give it a score of 100 and an empty \`issues\` array.
    7.  **Focused Review:** If you are asked to focus on only UI or only UX, the other category's analysis array should be empty, and its overall score should be 100.
  `;

  const uiFocus = `
    ## UI (User Interface) Analysis Checklist (Visual + Presentation Layer)
    
    **Contextual UX Laws:** When identifying UI issues, if a specific UX law (like Fitts's Law, Hick's Law, Jakob's Law, etc.) is directly applicable to the problem, you MUST reference it in the \`relevantLaw\` field for that issue. This provides deeper context for the visual problem.

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

    ### 4. Accessibility
    - **Color Contrast:** Check for WCAG AA compliance between text and background.
    - **Focus Indicators:** Ensure interactive elements have visible focus states for keyboard users.
    - **Touch Target Size:** Verify buttons and links are at least 44x44px for touchscreens.
    - **Alt Text:** Based on visual context, determine if images likely have meaningful alt text.
    - **Semantic Structure:** Infer if appropriate HTML (e.g., <nav>, <button>) is used based on visual roles.

    ### 5. Visual Consistency
    - **Style System:** Buttons, cards, and modals should follow a consistent style.
    - **Element Style:** Border radius, shadows, and icon styles should be consistent.

    ### 6. Imagery & Illustration
    - **Quality:** Images should have proper resolution and aspect ratio, with no pixelation.
    - **Consistency:** Illustrations should share a consistent style.
    - **Relevance:** Images should support the content, not just be decorative.

    ### 7. Feedback & States
    - **Element States:** All interactive elements must have hover, active, disabled, and focus states.
    - **Feedback:** Loading indicators, and clear error/success messages must be present.

    ### 8. Branding
    - **Logo & Identity:** Logo placement should be consistent (typically top-left). Colors and tone must match the brand identity.

    ### 9. Responsive & Device Adaptation
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
  reviewType: ReviewType,
  guideline: GuidelinePreset
): Promise<AnalysisResult> => {
  // Safely access the API key and initialize the client inside the function
  // to prevent an app-level crash if `process` is not defined on load.
  const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

  if (!API_KEY) {
    console.error("Gemini API key is not configured in the environment.");
    throw new Error("The AI service is not configured. Please contact support.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = getReviewPrompt(reviewType, guideline);

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
    
    if (result.isCaptcha) {
        throw new Error("The analysis was blocked by a security check (CAPTCHA). Automated tools cannot bypass these.");
    }
    if (result.isAccessDenied) {
        throw new Error("Access to this URL was blocked, likely by a security service (like Cloudflare) or a login requirement.");
    }
    if (result.isErrorPage) {
        throw new Error("The URL points to an error page (e.g., 404 Not Found). Please check the link is correct and the website is online.");
    }
    if (result.isNotUiScreenshot) {
        throw new Error("The uploaded image does not appear to be a website or application screenshot. Please upload a valid UI design.");
    }
    
    // Ensure scores are within bounds
    result.uiScore = Math.max(0, Math.min(100, Math.round(result.uiScore)));
    result.uxScore = Math.max(0, Math.min(100, Math.round(result.uxScore)));
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && (error.message.includes('CAPTCHA') || error.message.includes('Access') || error.message.includes('error page') || error.message.includes('not appear to be a website'))) {
      throw error;
    }
    throw new Error("Failed to get analysis from AI. The response might be malformed or the API call failed.");
  }
};
