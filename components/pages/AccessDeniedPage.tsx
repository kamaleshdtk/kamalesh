import React from 'react';

interface AccessDeniedPageProps {
  onBack: () => void;
  onUploadManually: () => void;
  reason?: string;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ onBack, onUploadManually, reason }) => {

  const defaultReason = "Our automated screenshot service couldn't access this resource. This often happens due to security services (like Cloudflare), login walls, or specific server permissions.";
  
  let displayMessage = reason || defaultReason;
  let errorTitle = "An Error Occurred";
  let errorCode = "Error";
  
  const reasonLower = reason?.toLowerCase() || '';

  if (reasonLower.includes('captcha')) {
      errorTitle = "Analysis Blocked by CAPTCHA";
      errorCode = "CAPTCHA";
      displayMessage = reason || "Our AI detected a CAPTCHA page. Automated tools cannot solve these security checks.";
  } else if (reasonLower.includes('access to this url was blocked')) {
      errorTitle = "Access Denied";
      errorCode = "403";
      displayMessage = reason || defaultReason;
  } else if (reasonLower.includes('points to an error page')) {
      errorTitle = "Error Page Found";
      errorCode = "404";
      displayMessage = reason || "The URL points to an error page (e.g., 404 Not Found). Please check the link is correct and the website is online.";
  } else if (reasonLower.includes('not appear to be a website')) {
      errorTitle = "Invalid Image Content";
      errorCode = "IMG";
      displayMessage = reason || "The uploaded image does not appear to be a website or application screenshot. Please upload a valid UI design.";
  } else if (reasonLower.includes('invalid url format')) {
      errorTitle = "Invalid URL Format";
      errorCode = "URL";
      displayMessage = reason || "The URL format you entered is invalid. Please ensure it's a valid web address (e.g., 'example.com').";
  } else {
      errorTitle = "Screenshot Failed";
      errorCode = "Error";
      // This will catch 'broken link', 'service busy', 'server error', 'network issue' from utils.ts
      displayMessage = reason || "We were unable to capture a screenshot for this URL. This might be a temporary network issue or the site may be offline.";
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-[#2D3748] text-center flex flex-col items-center p-8 sm:p-12 md:p-16 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold tracking-widest text-text-secondary dark:text-gray-400">ERROR</p>
        <h1 className="my-4 text-8xl md:text-9xl font-black text-text-primary dark:text-white flex items-center justify-center gap-2 sm:gap-4">
          <svg width="60" height="60" viewBox="0 0 100 100" className="flex-shrink-0 -mt-2 h-10 w-10 sm:h-14 sm:w-14">
            <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="#FF6B4A"/>
          </svg>
          {errorCode}
          <svg width="80" height="30" viewBox="0 0 120 40" className="flex-shrink-0 h-5 w-14 sm:h-7 sm:w-20">
             <path d="M0 20 Q 30 0, 60 20 T 120 20" stroke="#34D399" strokeWidth="8" fill="none" strokeLinecap="round"/>
          </svg>
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-text-primary dark:text-gray-200">{errorTitle}</p>
        <p className="mt-4 max-w-md mx-auto text-text-secondary dark:text-gray-400">
          {displayMessage}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack} 
            className="w-full sm:w-auto px-6 py-3 font-semibold text-text-secondary dark:text-gray-200 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={onUploadManually} 
            className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors"
          >
            Upload Screenshot Manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;