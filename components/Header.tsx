
import React, { useState } from 'react';

interface HeaderProps {
  user: {
    name: string;
    avatar: string;
  };
  onLogout: () => void;
  onNavigateToHome: () => void;
  onNavigateToNewReview: () => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigateToHome, onNavigateToNewReview, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50";
  const activeLinkClasses = "bg-primary/10 text-primary";
  const inactiveLinkClasses = "text-text-secondary hover:bg-gray-100 hover:text-text-primary";
  const mobileNavLinkClasses = "block px-4 py-2 rounded-md text-base font-medium";

  const handleMobileNavClick = (navFunc: () => void) => {
    navFunc();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
      <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
        {/* Left side: Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <button onClick={onNavigateToHome} className="flex items-center gap-2 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary">UXRay AI</h1>
          </button>
          
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={onNavigateToHome}
              aria-current={currentPage === 'home' || currentPage === 'report' ? 'page' : undefined}
              className={`${navLinkClasses} ${currentPage === 'home' || currentPage === 'report' ? activeLinkClasses : inactiveLinkClasses}`}
            >
              Home
            </button>
            <button
              onClick={onNavigateToNewReview}
              aria-current={currentPage === 'new_review' ? 'page' : undefined}
              className={`${navLinkClasses} ${currentPage === 'new_review' ? activeLinkClasses : inactiveLinkClasses}`}
            >
              New Review
            </button>
          </nav>
        </div>

        {/* Right side: User Info + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm font-medium text-text-secondary hidden sm:block">{user.name}</span>
            <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full" />
            <button onClick={onLogout} className="text-sm text-text-secondary hover:text-primary transition-colors">
              Logout
            </button>
          </div>
          <div className="md:hidden h-9 flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            <button
              onClick={() => handleMobileNavClick(onNavigateToHome)}
              aria-current={currentPage === 'home' || currentPage === 'report' ? 'page' : undefined}
              className={`w-full text-left ${mobileNavLinkClasses} ${currentPage === 'home' || currentPage === 'report' ? activeLinkClasses : inactiveLinkClasses}`}
            >
              Home
            </button>
            <button
              onClick={() => handleMobileNavClick(onNavigateToNewReview)}
              aria-current={currentPage === 'new_review' ? 'page' : undefined}
              className={`w-full text-left ${mobileNavLinkClasses} ${currentPage === 'new_review' ? activeLinkClasses : inactiveLinkClasses}`}
            >
              New Review
            </button>
            <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center px-4 py-2">
                    <img className="h-9 w-9 rounded-full" src={user.avatar} alt="User Avatar" />
                    <span className="ml-3 font-medium text-text-primary">{user.name}</span>
                </div>
                <button
                    onClick={() => handleMobileNavClick(onLogout)}
                    className={`w-full text-left ${mobileNavLinkClasses} ${inactiveLinkClasses}`}
                >
                    Logout
                </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
