'use client';
import React from 'react';

// --- Inline SVG Icon ---
const LogOutIcon = () => (
    <svg className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

// --- Type Definition ---
type LogoutButtonProps = {
  onClick: () => void; // Expects the logout function to be passed in
};

// --- Component (Named Export) ---
export function LogoutButton({ onClick }: LogoutButtonProps) {
  return (
    // Use group hover for icon color change
    <button
      onClick={onClick} // Call the passed-in function
      className="group flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
    >
      <LogOutIcon />
      <span>Logout</span>
    </button>
  );
}