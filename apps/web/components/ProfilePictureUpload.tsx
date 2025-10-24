// File: apps/web/components/ProfilePictureUpload.tsx
'use client';
import React, { useState } from 'react';
// Import shared UI components
import { Button, buttonVariants } from '@repo/ui';
import { AlertBox } from '@repo/ui';
// Import utility for merging classes
import { cn } from '@repo/ui/lib/utils'; // Make sure utils.ts is exported from ui/package.json

// --- Inline SVG Icons ---
const UploadCloudIcon = () => (<svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>);
const TrashIcon = () => (<svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const SpinnerIcon = () => (<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

// --- Types ---
type ProfilePictureUploadProps = {
  currentImage?: string | null;
  userName?: string | null;
  // userEmail prop removed as it's not used in this component
};

// --- Component ---
export default function ProfilePictureUpload({
  currentImage,
  userName,
}: ProfilePictureUploadProps) {
  // --- State ---
  const [image, setImage] = useState<string | null>(currentImage || null); // Displayed image (URL or base64)
  const [uploading, setUploading] = useState(false);                     // Loading state for API calls
  const [alert, setAlert] = useState<{msg: string, type: 'error' | 'success'} | null>(null); // Alert message state
  const [showConfirm, setShowConfirm] = useState(false);                 // Confirmation modal visibility

  // --- Helper Functions ---
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ').filter(Boolean);
    if (names.length === 0) return '?';
    const firstInitial = names[0]?.[0]?.toUpperCase();
    if (names.length === 1) return firstInitial || '?';
    const lastInitial = names[names.length - 1]?.[0]?.toUpperCase();
    const combined = (firstInitial || '') + (lastInitial || '');
    return combined || '?';
  };

  // --- Event Handlers ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // Reset file input immediately to allow re-uploading the same file

    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ msg: 'Image size must be less than 5MB.', type: 'error' }); return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
       setAlert({ msg: 'Invalid file type. Please use JPG, PNG, GIF, or WEBP.', type: 'error' }); return;
    }

    setUploading(true); setAlert(null); // Set loading state, clear alerts

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;
          // Send to API route
          const response = await fetch('/api/user/profile-picture', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64Image }),
          });

          if (response.ok) {
            setImage(base64Image); // Update UI optimistically
            setAlert({ msg: 'Upload successful! Refreshing...', type: 'success' });
            setTimeout(() => window.location.reload(), 1500); // Reload page to update Topbar etc.
          } else {
            // Handle API errors
            const errorData = await response.json().catch(() => ({ error: 'Upload failed.' }));
            setAlert({ msg: `Error: ${errorData.error || 'Please try again.'}`, type: 'error' });
            setUploading(false);
          }
        } catch (apiError) {
            console.error("API call error:", apiError);
            setAlert({ msg: 'Upload failed due to a server issue.', type: 'error' });
            setUploading(false);
        }
      };
      reader.onerror = () => {
        console.error("File reading error");
        setAlert({ msg: 'Could not read image file.', type: 'error' });
        setUploading(false);
      };
      reader.readAsDataURL(file); // Start reading
    } catch (readError) {
        console.error("File reader setup error:", readError);
        setAlert({ msg: 'Failed to prepare image for upload.', type: 'error' });
        setUploading(false);
    }
  };

  // Show confirmation modal
  const handleRemoveClick = () => { setShowConfirm(true); };

  // Actually remove the image via API
  const confirmRemoveImage = async () => {
    setShowConfirm(false); setUploading(true); setAlert(null);
    try {
      const response = await fetch('/api/user/profile-picture', { method: 'DELETE' });
      if (response.ok) {
        setImage(null); // Update UI
        setAlert({ msg: 'Image removed. Refreshing...', type: 'success' });
        setTimeout(() => window.location.reload(), 1500); // Reload page
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to remove.' }));
        setAlert({ msg: `Error: ${errorData.error || 'Please try again.'}`, type: 'error' });
        setUploading(false);
      }
    } catch (error) {
        console.error("Remove image API error:", error);
        setAlert({ msg: 'Failed to remove image.', type: 'error' });
        setUploading(false);
    }
  };

  // --- Render ---
  return (
    <div className="relative flex flex-col items-center"> {/* Center content */}

      {/* Alert Box - Positioned above image */}
      <div className="w-full max-w-xs mb-4"> {/* Constrain width */}
        <AlertBox message={alert?.msg || null} type={alert?.type || 'error'} onClose={() => setAlert(null)} />
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-3">Confirm Removal</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} disabled={uploading}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={confirmRemoveImage} disabled={uploading}>
                {uploading ? <SpinnerIcon/> : null} Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Display */}
      <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-indigo-300 ring-offset-2">
        {image ? (
          <img src={image} alt={userName || 'Profile'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white font-semibold">
            {getInitials(userName)}
          </div>
        )}
        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-medium backdrop-blur-sm">
             <SpinnerIcon />
             <span className="mt-1">Processing...</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        {/* Upload/Change Button (Styled Label) */}
        <label className={cn(
          buttonVariants({ variant: 'default', size: 'sm' }), "cursor-pointer inline-flex items-center", // Added flex items-center
          uploading && "opacity-60 cursor-not-allowed pointer-events-none" // Improved disabled style
        )}>
          <UploadCloudIcon />
          {image ? 'Change' : 'Upload'}
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageUpload} disabled={uploading} className="hidden" />
        </label>

        {/* Remove Button (Only shows if image exists) */}
        {image && (
          <Button variant="danger" size="sm" onClick={handleRemoveClick} disabled={uploading} className="inline-flex items-center"> {/* Added flex items-center */}
            <TrashIcon /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}