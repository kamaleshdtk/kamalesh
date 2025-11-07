

import { AnalysisReport } from './types';

export const fileToDataUrl = (file: File): Promise<{ data: string; mimeType: string; name: string; }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ 
        data: reader.result as string, 
        mimeType: file.type,
        name: file.name,
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const urlToDataUrl = async (url: string): Promise<{ data: string; mimeType: string }> => {
  try {
    // Validate and format URL
    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
    }
    new URL(fullUrl); // This will throw an error for invalid URLs

    // PERMANENT FIX: Switched from the rate-limited Google PageSpeed API 
    // to a more reliable, dedicated screenshot service (WordPress mshots) to resolve 429 errors.
    const screenshotApiUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(fullUrl)}?w=1200`; // Request a wider screenshot for better analysis

    const response = await fetch(screenshotApiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch screenshot. The service may be temporarily unavailable or the URL is invalid. (Status: ${response.status})`);
    }
    
    const imageBlob = await response.blob();

    // Convert blob to data URL which is what our AI service expects
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve({
                data: reader.result as string,
                mimeType: imageBlob.type, // e.g., 'image/jpeg'
            });
        };
        reader.onerror = (err) => reject(new Error("Failed to convert screenshot to data URL."));
        reader.readAsDataURL(imageBlob);
    });

  } catch (error) {
    console.error("Error capturing website screenshot:", error);
    if (error instanceof Error && error.message.includes('Status:')) {
        throw error;
    }
    throw new Error("Could not capture a screenshot. The URL may be invalid, private, or the service may be unavailable.");
  }
};

export const getDisplayName = (report: AnalysisReport): string => {
  if (report.input_type === 'URL') {
    try {
      let fullUrl = report.input_value;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }
      const url = new URL(fullUrl);
      return url.hostname.replace(/^www\./, '');
    } catch (e) {
      // Fallback for invalid URLs
      return report.input_value;
    }
  }
  return report.input_value; // Return filename for images
};