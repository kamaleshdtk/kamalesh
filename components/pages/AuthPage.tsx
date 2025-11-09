import React from 'react';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.2857 2C9.57143 2 8.99999 2.57143 8.99999 3.28571C8.99999 4 9.57143 4.57143 10.2857 4.57143C12.4286 4.57143 14.1429 6.28571 14.1429 8.42857C14.1429 9.57143 13.5714 10.5714 12.7143 11.2857C11.8571 12 11.2857 13.1429 11.2857 14.2857V15.7143C11.2857 16.4286 11.8571 17 12.5714 17C13.2857 17 13.8571 16.4286 13.8571 15.7143V14.2857C13.8571 12.5714 14.7143 11 15.8571 10.1429C17.1429 9.14286 17.8571 7.42857 17.8571 5.71429C17.8571 3.57143 15.7143 2 13.2857 2H10.2857Z" fill="#4F46E5"/>
                  <path d="M12.5714 20C11.8571 20 11.2857 20.5714 11.2857 21.2857C11.2857 22 11.8571 22.5714 12.5714 22.5714C13.2857 22.5714 13.8571 22 13.8571 21.2857C13.8571 20.5714 13.2857 20 12.5714 20Z" fill="#4F46E5"/>
                </svg>
              <h1 className="text-3xl font-extrabold text-text-primary dark:text-white">UXRay</h1>
            </div>
          <h2 className="text-xl font-bold text-text-primary dark:text-white">Welcome Back</h2>
          <p className="mt-2 text-text-secondary dark:text-gray-400">Sign in to review your designs.</p>
        </div>
        <div className="space-y-4">
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 text-white font-medium bg-primary hover:bg-primary-light transition-all duration-200 rounded-lg"
            >
              Sign In (Demo)
            </button>
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
            >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44.5 24.3H42.7V24H24V27.3H35.3C33.9 32.2 29.2 36 24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C27.1 12 29.8 13.1 32 14.9L34.5 12.4C31.5 9.7 28 8 24 8C15.2 8 8 15.2 8 24C8 32.8 15.2 40 24 40C32.8 40 40 32.8 40 24C40 22.1 39.8 20.4 39.4 18.8C38.6 15.8 36.9 13.2 34.5 11.1L32.1 13.5C33.5 14.8 34.6 16.4 35.3 18.3H24V21.6H44.5C44.5 22.5 44.5 23.4 44.5 24.3Z" fill="#4285F4"/>
            </svg>
            Sign In with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;