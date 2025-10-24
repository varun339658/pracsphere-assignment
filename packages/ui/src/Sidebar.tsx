'use client';

import React from 'react';
import { LogoutButton } from "./LogoutButton"; // Assumes LogoutButton is in the same directory

// --- Types ---
type SidebarProps = {
  onLogout: () => void;            // Expecting the signOut function
  children: React.ReactNode;      // Will render the links passed from the layout
};

// --- Main Sidebar Component (Named Export) ---
// It no longer takes linkComponent or pathname
export function Sidebar({ onLogout, children }: SidebarProps) {
  return (
    // Main aside element: fixed width, full height, flex column layout, border, background, sticky positioning
    <aside className="w-64 bg-white h-screen flex flex-col border-r border-gray-200 sticky top-0 flex-shrink-0">

      {/* Header */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-white text-md">P</span>
        </div>
        <span className="text-lg font-semibold text-gray-800 truncate">PracSphere</span>
      </div>

      {/* Nav Links - Renders whatever children are passed in */}
      {/* flex-1 makes it take available space, p-3 for padding, space-y-1 for spacing between links, overflow-y-auto */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {children} {/* <-- LINKS WILL BE RENDERED HERE */}
      </nav>

      {/* Footer Logout */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <LogoutButton onClick={onLogout} />
      </div>
    </aside>
  );
}