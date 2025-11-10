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
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C13.84 22 15.58 21.5 17.07 20.66V3.34C15.58 2.5 13.84 2 12 2Z" fill="#4F46E5" fillOpacity="0.4"/>
                  <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z" fill="#4F46E5"/>
                </svg>
              <h1 className="text-3xl font-extrabold text-text-primary dark:text-white">Design Audit</h1>
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