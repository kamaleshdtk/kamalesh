
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

    // PERMANENT FIX: The previous screenshot service was unreliable and causing 400 errors.
    // Switched to a more stable, public, keyless service (WordPress mShots) for robustness.
    const encodedUserUrl = encodeURIComponent(fullUrl);
    const screenshotServiceUrl = `https://s0.wp.com/mshots/v1/${encodedUserUrl}?w=1280&h=800`;
    
    const response = await fetch(screenshotServiceUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch screenshot. The service may be temporarily unavailable or the URL is invalid. (Status: ${response.status})`);
    }
    const blob = await response.blob();

    if (blob.size === 0) {
        throw new Error('Screenshot service returned an empty image. The website might be inaccessible.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve({ data: reader.result, mimeType: blob.type || 'image/jpeg' });
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