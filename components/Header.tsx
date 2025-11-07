
import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  user: {
    name: string;
    avatar: string;
  };
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateToNewReview: () => void;
  onNavigateToHistory: () => void;
}

const Logo: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 flex-shrink-0" aria-label="Go to homepage">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.2857 2C9.57143 2 8.99999 2.57143 8.99999 3.28571C8.99999 4 9.57143 4.57143 10.2857 4.57143C12.4286 4.57143 14.1429 6.28571 14.1429 8.42857C14.1429 9.57143 13.5714 10.5714 12.7143 11.2857C11.8571 12 11.2857 13.1429 11.2857 14.2857V15.7143C11.2857 16.4286 11.8571 17 12.5714 17C13.2857 17 13.8571 16.4286 13.8571 15.7143V14.2857C13.8571 12.5714 14.7143 11 15.8571 10.1429C17.1429 9.14286 17.8571 7.42857 17.8571 5.71429C17.8571 3.57143 15.7143 2 13.2857 2H10.2857Z" fill="#7E57FF"/>
      <path d="M12.5714 20C11.8571 20 11.2857 20.5714 11.2857 21.2857C11.2857 22 11.8571 22.5714 12.5714 22.5714C13.2857 22.5714 13.8571 22 13.8571 21.2857C13.8571 20.5714 13.2857 20 12.5714 20Z" fill="#7E57FF"/>
    </svg>
    <h1 className="text-xl font-extrabold text-text-primary">UXRay</h1>
  </button>
);


const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigateHome, onNavigateToNewReview, onNavigateToHistory }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);


  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors";
  
  return (
    <header className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-20 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Left side: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo onClick={onNavigateHome} />
            <nav className="hidden md:flex items-center gap-4">
              <button disabled className={`${navLinkClasses} opacity-50 cursor-not-allowed`}>Products</button>
              <button disabled className={`${navLinkClasses} opacity-50 cursor-not-allowed`}>Pricing</button>
              <button onClick={onNavigateToHistory} className={navLinkClasses}>History</button>
            </nav>
          </div>

          {/* Right side: User Info + Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <button
                  onClick={onNavigateToNewReview}
                  className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                >
                  + New Review
              </button>
               <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 group">
                    <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full" />
                    <svg className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div 
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200/80 origin-top-right transition-all duration-200 ease-out
                  ${isUserMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1 pointer-events-none'}`}
                >
                    <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b">{user.name}</div>
                    <button 
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
               </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
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

      {/* Mobile Menu Panel */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`} id="mobile-menu">
        <nav className="px-2 pt-2 pb-4 space-y-1">
           <button disabled className={`${navLinkClasses} block w-full text-left opacity-50 cursor-not-allowed`}>Products</button>
           <button disabled className={`${navLinkClasses} block w-full text-left opacity-50 cursor-not-allowed`}>Pricing</button>
           <button onClick={() => { onNavigateToHistory(); setIsMenuOpen(false); }} className={`${navLinkClasses} block w-full text-left`}>History</button>
           <div className="px-2 pt-4">
              <button
                onClick={() => { onNavigateToNewReview(); setIsMenuOpen(false); }}
                className="w-full bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-light transition-colors"
              >
                + New Review
            </button>
           </div>
          <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex items-center px-4 py-2">
                  <img className="h-9 w-9 rounded-full" src={user.avatar} alt="User Avatar" />
                  <span className="ml-3 font-medium text-text-primary">{user.name}</span>
              </div>
              <button
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className={`w-full text-left ${navLinkClasses} block`}
              >
                  Logout
              </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
