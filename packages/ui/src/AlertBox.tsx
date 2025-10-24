'use client';
import React from 'react';

// --- Inline SVG Icons ---
const InfoIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const CheckCircleIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const AlertTriangleIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const XIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);


// --- Types ---
type AlertBoxProps = {
  message: string | null; // Message to display
  type: 'error' | 'success' | 'info'; // Alert type determines styling
  onClose?: () => void; // Optional close handler
};

// --- Component ---
export function AlertBox({ message, type = 'info', onClose }: AlertBoxProps) {
  // Don't render if there's no message
  if (!message) return null;

  // Determine styles and icon based on the alert type
  let bgClass = 'bg-blue-50 border-blue-200';
  let textClass = 'text-blue-800';
  let iconClass = 'text-blue-500';
  let IconComponent = InfoIcon;

  if (type === 'error') {
    bgClass = 'bg-red-50 border-red-200';
    textClass = 'text-red-800';
    iconClass = 'text-red-500';
    IconComponent = AlertTriangleIcon;
  } else if (type === 'success') {
    bgClass = 'bg-green-50 border-green-200';
    textClass = 'text-green-800';
    iconClass = 'text-green-500';
    IconComponent = CheckCircleIcon;
  }

  return (
    // Main alert container with padding, rounded corners, border, and background color
    <div className={`p-4 rounded-md border ${bgClass}`} role="alert">
      <div className="flex items-start"> {/* Use items-start for alignment */}
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconClass}`}>
          <IconComponent />
        </div>
        {/* Message Text */}
        <div className={`ml-3 flex-1 text-sm font-medium ${textClass}`}>
          {message}
        </div>
        {/* Optional Close Button */}
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                // Styling for the close button, matches text color on hover
                className={`inline-flex rounded-md p-1.5 ${textClass.replace('text-','bg-')} bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${textClass.replace('text-','focus:ring-offset-').replace('800','50') /* Adjust focus ring offset color */} ${textClass.replace('text-','focus:ring-') /* Adjust focus ring color */}`}
                onClick={onClose}
                aria-label="Dismiss"
              >
                <span className="sr-only">Dismiss</span>
                <XIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}