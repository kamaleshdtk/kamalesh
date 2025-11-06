
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
    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    new URL(url); // This will throw an error for invalid URLs

    // Explicitly request PNG format to avoid unsupported MIME types like image/gif
    const screenshotServiceUrl = `https://image.thum.io/get/format/png/width/1280/crop/800/${url}`;
    const response = await fetch(screenshotServiceUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch screenshot. Service returned status: ${response.status}`);
    }
    const blob = await response.blob();

    if (blob.size === 0) {
        throw new Error('Screenshot service returned an empty image. The website might be inaccessible.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // The service should return PNG, but we'll use the blob's type for accuracy.
          resolve({ data: reader.result, mimeType: blob.type });
        } else {
          reject(new Error('Failed to convert screenshot blob to data URL.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error capturing website screenshot:", error);
    throw new Error("Could not capture a screenshot. The URL may be invalid, private, or the service may be unavailable.");
  }
};
