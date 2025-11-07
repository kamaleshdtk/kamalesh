

import { AnalysisReport } from './types';

// Simple hash function for creating a cache key from image data
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
};


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

    // PERMANENT FIX: Switched from the rate-limited Google PageSpeed API to a more reliable service.
    // This resolves the '429 Too Many Requests' error.
    const screenshotApiUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(fullUrl)}?w=1280`;

    const response = await fetch(screenshotApiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch screenshot. The service may be temporarily unavailable or the URL is invalid. (Status: ${response.status})`);
    }
    
    const imageBlob = await response.blob();
    const mimeType = imageBlob.type;

    // The Gemini API does not support GIFs which this service sometimes returns.
    // We block GIFs on the client side to prevent an API error.
    if (mimeType === 'image/gif') {
        throw new Error('The screenshot service returned an unsupported image format (GIF). Please try a different URL or upload an image.');
    }
    
    // Convert the image blob to a base64 data URL
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new Error("Failed to process the screenshot image."));
        };
        reader.onload = () => {
            resolve({
                data: reader.result as string,
                mimeType: mimeType,
            });
        };
        reader.readAsDataURL(imageBlob);
    });

  } catch (error) {
    console.error("Error capturing website screenshot:", error);
    if (error instanceof Error && (error.message.includes('Status:') || error.message.includes('GIF'))) {
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

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
