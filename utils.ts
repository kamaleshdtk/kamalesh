
import pako from 'pako';
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

// Function to compress and encode report data for sharing
export const encodeReportData = (report: AnalysisReport): string => {
  try {
    const jsonString = JSON.stringify(report);
    const compressed = pako.deflate(jsonString);

    // FIX: Process Uint8Array in chunks to avoid "Maximum call stack size exceeded" for large reports.
    let binaryString = '';
    const CHUNK_SIZE = 8192; // Process in 8KB chunks
    for (let i = 0; i < compressed.length; i += CHUNK_SIZE) {
        binaryString += String.fromCharCode.apply(null, compressed.subarray(i, i + CHUNK_SIZE) as unknown as number[]);
    }

    return encodeURIComponent(btoa(binaryString));
  } catch (e) {
    console.error("Failed to encode report data:", e);
    return "";
  }
};

// Function to decode and decompress report data from a URL
export const decodeReportData = (encodedData: string): AnalysisReport | null => {
  try {
    // Decode from URL-safe format and then from Base64
    const compressedString = atob(decodeURIComponent(encodedData));
    // pako.inflate expects a Uint8Array (or similar). The binary string from atob must be converted.
    const compressedBytes = new Uint8Array(compressedString.length);
    for (let i = 0; i < compressedString.length; i++) {
        compressedBytes[i] = compressedString.charCodeAt(i);
    }
    // Inflate (decompress) the string
    const jsonString = pako.inflate(compressedBytes, { to: 'string' });
    // Parse the JSON string back into an object
    return JSON.parse(jsonString) as AnalysisReport;
  } catch (e) {
    console.error("Failed to decode report data:", e);
    return null;
  }
};
