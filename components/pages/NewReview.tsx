
import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { ReviewType } from '../../types';

interface NewReviewProps {
  onSubmit: (
    image: { data: string; mimeType: string },
    reviewType: ReviewType,
    inputValue: string,
    inputType: 'URL' | 'Image'
  ) => void;
  error: string | null;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const NewReview: React.FC<NewReviewProps> = ({ onSubmit, error }) => {
  const [reviewType, setReviewType] = useState<ReviewType>(ReviewType.UI);
  const [image, setImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("File size exceeds 4MB. Please upload a smaller image.");
        return;
      }
      const dataUrl = await fileToDataUrl(file);
      setImage({ data: dataUrl, mimeType: file.type, name: file.name });
      setUrl('');
    }
  }, []);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setImage(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (image) {
      onSubmit(image, reviewType, image.name, 'Image');
    } else if (url) {
      // In a real app, you'd fetch the URL on a backend, screenshot it, and use that image.
      // For this demo, we'll use a placeholder image and pass the URL value.
      const placeholderImage = { data: `https://picsum.photos/seed/${encodeURIComponent(url)}/1280/800`, mimeType: 'image/jpeg' };
      // This is a simplified flow. A real implementation would convert the picsum URL to base64 first.
      // For simplicity here, we alert the user about the simulation.
      alert(`URL analysis is simulated. A screenshot of a placeholder image will be used for "${url}".`);
       const fakeScreenshot = { data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', mimeType: 'image/png' };
      onSubmit(fakeScreenshot, reviewType, url, 'URL');
    } else {
      alert('Please upload an image or enter a URL.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-xl shadow-soft">
        <h2 className="text-2xl font-bold text-center text-text-primary mb-1">Start a New Review</h2>
        <p className="text-center text-text-secondary mb-8">Upload a screenshot or paste a URL to get started.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">1. Provide a design</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div
                className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  image ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                <p className="mt-1 text-sm text-text-secondary">{image ? image.name : 'Upload Screenshot'}</p>
              </div>
              <div className="flex items-center text-text-secondary">or</div>
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Paste website URL"
                className={`flex-1 block w-full bg-white border-2 rounded-lg p-4 transition-colors focus:ring-primary focus:border-primary placeholder-text-secondary ${
                  url ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">2. Choose review type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.values(ReviewType)).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReviewType(type)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    reviewType === type ? 'bg-primary text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-text-secondary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!image && !url}
            className="w-full bg-primary text-white font-semibold py-3 px-5 rounded-lg hover:bg-primary-light transition-all duration-300 shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Analysis
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReview;