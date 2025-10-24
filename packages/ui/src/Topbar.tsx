'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Inline SVG Icons ---
const ChevronDownIcon = () => (<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>);
const ProfileIcon = () => (<svg className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const LogoutIcon = () => (<svg className="w-[18px] h-[18px] text-gray-500 group-hover:text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);

// --- Types ---
type TopbarProps = {
  userName?: string | null;
  userEmail?: string | null;
  profileImage?: string | null; // Expects a URL or null
  onLogout: () => void;
  onViewProfile: () => void;
  pageTitle?: string;
};

// --- Component (Named Export) ---
export function Topbar({
  userName,
  userEmail,
  profileImage,
  onLogout,
  onViewProfile,
  pageTitle = "Dashboard"
}: TopbarProps) {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Effect to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to generate initials (Corrected)
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ').filter(Boolean); // Split and remove empty strings

    if (names.length === 0) return '?'; // Handle empty name after split

    const firstInitial = names[0]?.[0]?.toUpperCase(); // Safely get first initial

    if (names.length === 1) {
      return firstInitial || '?'; // Return first initial or fallback
    }

    const lastInitial = names[names.length - 1]?.[0]?.toUpperCase(); // Safely get last initial

    // Combine ensuring at least one initial exists, even if first or last fails
    const combined = (firstInitial || '') + (lastInitial || '');
    return combined.length > 0 ? combined : '?'; // Return combined or fallback
  };


  return (
    <header className="h-16 flex justify-between items-center bg-white px-4 sm:px-6 border-b border-gray-200 sticky top-0 z-40 flex-shrink-0">
      {/* Left Side: Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      {/* Right Side: User Menu */}
      <div className="relative" ref={dropdownRef}>
        {/* Button to toggle dropdown */}
        <button
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 outline-none"
          onClick={toggleDropdown} aria-label="User menu" aria-expanded={isOpen}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold border border-gray-200">{getInitials(userName)}</div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full" />
          </div>
          {/* Name (Optional, shown on larger screens) */}
          <span className="hidden sm:inline text-sm font-medium text-gray-700">{userName || 'Guest'}</span>
          {/* Dropdown Arrow */}
          <div className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}><ChevronDownIcon /></div>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.1, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 focus:outline-none"
              role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex={-1}
            >
              {/* Dropdown Header Section */}
              <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                 <div className="relative flex-shrink-0">
                   {profileImage ? (<img src={profileImage} alt="Profile" className="w-9 h-9 rounded-full object-cover"/>)
                   : (<div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">{getInitials(userName)}</div>)}
                 </div>
                 <div className="min-w-0">
                   <p className="text-sm font-semibold text-gray-800 truncate">{userName || 'Guest'}</p>
                   <p className="text-xs text-gray-500 truncate">{userEmail || ''}</p>
                 </div>
              </div>
              {/* Dropdown Action Buttons */}
              <div role="none" className="py-1">
                <button
                  className="group w-full flex items-center gap-3 py-2 px-4 text-left text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 focus:bg-gray-100 outline-none"
                  onClick={() => { onViewProfile(); setIsOpen(false); }} role="menuitem" tabIndex={-1}
                ><ProfileIcon /> <span>View Profile</span></button>
                <button
                  className="group w-full flex items-center gap-3 py-2 px-4 text-left text-sm font-medium transition-colors duration-150 text-gray-700 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 outline-none"
                  onClick={() => { onLogout(); setIsOpen(false); }} role="menuitem" tabIndex={-1}
                ><LogoutIcon /> <span>Logout</span></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}