import React, { useState, useEffect, useRef } from 'react';
import { DashboardTab, Theme } from '../../App';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateToDashboard: (tab: DashboardTab) => void;
  onNavigateToPricing: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const Logo: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 flex-shrink-0" aria-label="Go to homepage">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.2857 2C9.57143 2 8.99999 2.57143 8.99999 3.28571C8.99999 4 9.57143 4.57143 10.2857 4.57143C12.4286 4.57143 14.1429 6.28571 14.1429 8.42857C14.1429 9.57143 13.5714 10.5714 12.7143 11.2857C11.8571 12 11.2857 13.1429 11.2857 14.2857V15.7143C11.2857 16.4286 11.8571 17 12.5714 17C13.2857 17 13.8571 16.4286 13.8571 15.7143V14.2857C13.8571 12.5714 14.7143 11 15.8571 10.1429C17.1429 9.14286 17.8571 7.42857 17.8571 5.71429C17.8571 3.57143 15.7143 2 13.2857 2H10.2857Z" fill="#4F46E5"/>
      <path d="M12.5714 20C11.8571 20 11.2857 20.5714 11.2857 21.2857C11.2857 22 11.8571 22.5714 12.5714 22.5714C13.2857 22.5714 13.8571 22 13.8571 21.2857C13.8571 20.5714 13.2857 20 12.5714 20Z" fill="#4F46E5"/>
    </svg>
    <h1 className="text-xl font-extrabold text-text-primary dark:text-white">UXRay</h1>
  </button>
);


const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigateHome, onNavigateToDashboard, onNavigateToPricing, theme, setTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        setIsProductsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef, productsMenuRef]);

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors";
  const userMenuItemClasses = "flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md";

  const handleUserMenuClick = (tab: DashboardTab) => {
    onNavigateToDashboard(tab);
    setIsUserMenuOpen(false);
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Logo onClick={onNavigateHome} />
            <nav className="hidden md:flex items-center gap-4">
              <div className="relative" ref={productsMenuRef}>
                <button 
                  onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
                  className={`${navLinkClasses} flex items-center gap-1`}
                >
                  Products
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProductsMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-200 dark:border-gray-700 origin-top-left transition-all duration-200 ease-out
                  ${isProductsMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <a href="#" className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60">Heatmaps <span className="text-xs text-primary font-semibold">Soon</span></a>
                  <a href="#" className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60">Click Maps <span className="text-xs text-primary font-semibold">Soon</span></a>
                  <a href="#" className="flex justify-between items-center w-full text-left px-4 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60">Session Replays <span className="text-xs text-primary font-semibold">Soon</span></a>
                </div>
              </div>
              <button onClick={onNavigateToPricing} className={navLinkClasses}>Pricing</button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-4">
               <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 group">
                    <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full" />
                </button>
                <div 
                  className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700 origin-top-right transition-all duration-200 ease-out
                  ${isUserMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                    <div className="px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700 mb-2">
                      <p className="font-bold text-text-primary dark:text-white">{user.name}</p>
                      <p className="text-text-secondary dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => handleUserMenuClick('profile')} className={userMenuItemClasses}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       My Profile
                    </button>
                    <button onClick={() => handleUserMenuClick('billing')} className={userMenuItemClasses}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        My Plan / Upgrade
                    </button>
                    <button onClick={() => handleUserMenuClick('reviews')} className={userMenuItemClasses}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                       My Reviews (History)
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2"></div>
                    <div className="px-2 py-1">
                      <label htmlFor="theme-switcher" className="text-sm font-medium text-text-secondary dark:text-gray-400 block mb-1 px-2">Theme</label>
                      <select
                        id="theme-switcher"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as Theme)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 px-2 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="light">🌞 Light</option>
                        <option value="dark">🌚 Dark</option>
                        <option value="system">🖥️ System</option>
                      </select>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-2"></div>
                    <button onClick={onLogout} className={userMenuItemClasses}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                    </button>
                </div>
               </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-primary focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-8 6h8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${isMenuOpen ? 'max-h-[500px]' : 'max-h-0'}`} id="mobile-menu">
        <nav className="px-2 pt-2 pb-4 space-y-1">
           <div>
             <button onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)} className={`${navLinkClasses} flex justify-between items-center w-full text-left`}>
               Products
               <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isMobileProductsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </button>
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileProductsOpen ? 'max-h-48' : 'max-h-0'}`}>
               <div className="pl-4 pt-1 pb-2 space-y-1">
                 <a href="#" className={`${navLinkClasses} block w-full text-left opacity-50 cursor-not-allowed`}>Heatmaps</a>
                 <a href="#" className={`${navLinkClasses} block w-full text-left opacity-50 cursor-not-allowed`}>Click Maps</a>
                 <a href="#" className={`${navLinkClasses} block w-full text-left opacity-50 cursor-not-allowed`}>Session Replays</a>
               </div>
             </div>
           </div>
           <button onClick={() => { onNavigateToPricing(); setIsMenuOpen(false); }} className={`${navLinkClasses} block w-full text-left`}>Pricing</button>

          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4 py-2">
                  <img className="h-9 w-9 rounded-full" src={user.avatar} alt="User Avatar" />
                  <div className="ml-3">
                    <div className="text-base font-medium text-text-primary dark:text-white">{user.name}</div>
                  </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                  <button onClick={() => { onNavigateToDashboard('profile'); setIsMenuOpen(false); }} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">My Profile</button>
                  <button onClick={() => { onNavigateToDashboard('reviews'); setIsMenuOpen(false); }} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">My Reviews</button>
                  <button onClick={() => { onNavigateToDashboard('billing'); setIsMenuOpen(false); }} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">Billing</button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-3"></div>
                  <button onClick={onLogout} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">
                      Logout
                  </button>
              </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;