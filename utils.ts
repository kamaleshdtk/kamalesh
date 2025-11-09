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

// Resizes an image to a maximum dimension while maintaining aspect ratio
export const resizeImage = (dataUrl: string, mimeType: string, maxSize = 1024): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Use 0.9 quality for JPEG to further reduce size
      resolve({ data: canvas.toDataURL(mimeType, 0.9), mimeType });
    };
    img.onerror = (error) => reject(error);
  });
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

// Helper function for retrying with exponential backoff, configured to fail faster.
const fetchWithRetry = async (url: string, retries = 2, delay = 1500): Promise<Response> => {
    try {
        const response = await fetch(url);
        if (response.status === 429 && retries > 0) {
            console.warn(`Screenshot service busy (429). Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, retries - 1, delay * 2);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch failed. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, retries - 1, delay * 2);
        }
        throw error;
    }
};

// Converts a GIF blob to a PNG data URL
const convertGifToPng = (blob: Blob): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Could not get canvas context for GIF conversion.'));
      }
      ctx.drawImage(img, 0, 0);
      const pngDataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url); // Clean up the object URL
      resolve({ data: pngDataUrl, mimeType: 'image/png' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load GIF image for conversion.'));
    };
    img.src = url;
  });
};


export const urlToDataUrl = async (url: string, attemptFullPage: boolean): Promise<{ data: string; mimeType: string }> => {
  try {
    // Validate and format URL
    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
    }
    
    try {
        new URL(fullUrl); // This will throw an error for invalid URLs
    } catch (e) {
        throw new Error("The URL format is invalid. Please check it and try again (e.g., 'example.com').");
    }

    const height = attemptFullPage ? 2048 : 720;
    const screenshotApiUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(fullUrl)}?w=1280&h=${height}`;

    const response = await fetchWithRetry(screenshotApiUrl);
    
    if (!response.ok) {
      if (response.status === 429) {
          throw new Error('The screenshot service is busy due to high traffic. Please try again in a moment.');
      }
      if (response.status >= 400 && response.status < 500) {
          throw new Error(`We couldn't access this URL. It might be offline, private, or a broken link. (Error: ${response.status})`);
      }
      throw new Error(`The screenshot service failed due to a server error. (Status: ${response.status})`);
    }
    
    const imageBlob = await response.blob();
    const mimeType = imageBlob.type;
    
    // If the service returns a GIF, convert it to PNG client-side.
    if (mimeType === 'image/gif') {
        console.warn('Screenshot service returned a GIF, converting to PNG...');
        return convertGifToPng(imageBlob);
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
    if (error instanceof Error) {
        // Re-throw specific, user-friendly errors from within the try block
        throw error;
    }
    // Generic fallback for completely unexpected errors (like network failure in fetchWithRetry)
    throw new Error("Could not capture a screenshot due to a network issue or an unknown problem.");
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