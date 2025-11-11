

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
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 2, delay = 1500): Promise<Response> => {
    try {
        const response = await fetch(url, options);
        if (response.status === 429 && retries > 0) {
            console.warn(`Screenshot service busy (429). Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch failed. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        throw error;
    }
};

const screenshotProviders = [
  {
    name: 'thum.io',
    getUrl: (url: string, fullPage: boolean) => {
      const encodedUrl = encodeURIComponent(url);
      return fullPage
        ? `https://image.thum.io/get/fullpage/${encodedUrl}`
        : `https://image.thum.io/get/width/1280/crop/800/${encodedUrl}`;
    },
    needsProxy: false,
  },
  {
    name: 'screen.rip',
    getUrl: (url: string, fullPage: boolean) => {
        const encodedUrl = encodeURIComponent(url);
        const params = new URLSearchParams({ url: encodedUrl });
        if (fullPage) {
            params.set('fullpage', 'true');
        } else {
            params.set('width', '1280');
            params.set('height', '800');
        }
        return `https://screen.rip/api?${params.toString()}`;
    },
    needsProxy: true,
  },
  {
    name: 'versatyle.dev',
    getUrl: (url: string, fullPage: boolean) => {
        const encodedUrl = encodeURIComponent(url);
        const params = new URLSearchParams({ url: encodedUrl });
        if (fullPage) {
            params.set('full', 'true');
        } else {
            params.set('width', '1280');
            params.set('height', '800');
        }
        return `https://api.versatyle.dev/v1/screenshot?${params.toString()}`;
    },
    needsProxy: true,
  },
  {
    name: 'shot.screenshotapi.net',
    getUrl: (url: string, fullPage: boolean) => {
        const encodedUrl = encodeURIComponent(url);
        const params = new URLSearchParams({ url: encodedUrl });
        if (fullPage) {
            params.set('full_page', 'true');
        } else {
            params.set('width', '1280');
            params.set('height', '800');
        }
        return `https://shot.screenshotapi.net/screenshot?${params.toString()}`;
    },
    needsProxy: true,
  },
  {
    name: 'render-tron.appspot.com',
    getUrl: (url: string, fullPage: boolean) => {
        const encodedUrl = encodeURIComponent(url);
        const params = new URLSearchParams();
        if (fullPage) {
            params.set('fullPage', 'true');
        } else {
            params.set('width', '1280');
            params.set('height', '800');
        }
        return `https://render-tron.appspot.com/screenshot/${url}?${params.toString()}`;
    },
    needsProxy: true,
  },
  {
    name: 'screen-shot.xyz',
    getUrl: (url: string, fullPage: boolean) => {
      const encodedUrl = encodeURIComponent(url);
      const params = new URLSearchParams({
        url: encodedUrl,
        ...(fullPage && { full_page: 'true' }),
        ...(!fullPage && { width: '1280', height: '800' }),
      });
      return `https://api.screen-shot.xyz/take?${params.toString()}`;
    },
    needsProxy: true,
  },
  {
    name: 'screenshotmachine.com',
    getUrl: (url: string, fullPage: boolean) => {
      const encodedUrl = encodeURIComponent(url);
      const params = new URLSearchParams({
        key: 'ca9249', // Public key from their site's demo tool
        url: encodedUrl,
        device: 'desktop',
        cacheLimit: '0',
        ...(fullPage && { full: '1' }),
        ...(!fullPage && { dimension: '1280x800' }),
      });
      return `https://www.screenshotmachine.com/capture.php?${params.toString()}`;
    },
    needsProxy: true,
  },
  {
    name: 'url-to-pdf-api.herokuapp.com',
    getUrl: (url: string, fullPage: boolean) => {
      const encodedUrl = encodeURIComponent(url);
      const params = new URLSearchParams({
        url: encodedUrl,
        output: 'screenshot',
        ...(fullPage && { fullPage: 'true' }),
      });
      return `https://url-to-pdf-api.herokuapp.com/api/render?${params.toString()}`;
    },
    needsProxy: true,
  }
];


export const urlToDataUrl = async (url: string, attemptFullPage: boolean): Promise<{ data: string; mimeType: string }> => {
  // 1. Validate and format URL
  let fullUrl = url;
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    fullUrl = 'https://' + fullUrl;
  }
  try {
    new URL(fullUrl);
  } catch (e) {
    throw new Error("The URL format is invalid. Please check it and try again (e.g., 'example.com').");
  }
  
  const errors: string[] = [];

  for (const provider of screenshotProviders) {
    try {
        console.log(`Trying screenshot provider: ${provider.name}`);
        let apiUrl = provider.getUrl(fullUrl, attemptFullPage);

        if (provider.needsProxy) {
            apiUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        }
      
        const response = await fetchWithRetry(apiUrl);

        if (!response.ok) {
            throw new Error(`Provider ${provider.name} failed with status: ${response.status}`);
        }

        const imageBlob = await response.blob();
        const mimeType = imageBlob.type || 'image/png';

        if (imageBlob.size < 2048) { // A small blob size might indicate an error image
            throw new Error(`Provider ${provider.name} returned an empty or invalid image.`);
        }

        // Success! Convert blob to data URL and return.
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({ data: reader.result as string, mimeType });
            };
            reader.onerror = () => reject(new Error("Failed to read the screenshot image data."));
            reader.readAsDataURL(imageBlob);
        });

    } catch (error: any) {
        console.error(`Error with provider ${provider.name}:`, error.message);
        errors.push(`${provider.name}: ${error.message}`);
    }
  }

  // If the loop completes without returning, all providers have failed.
  console.error("All screenshot providers failed.", errors);
  throw new Error("We couldn't access this URL. The site might be offline, private, or blocking all our screenshot services.");
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

export const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) return null;
    
    const match = arr[0].match(/:(.*?);/);
    if (!match) return null;
    const mime = match[1];

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};