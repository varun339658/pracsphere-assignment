// File: apps/web/components/DashboardWrapper.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

// This wrapper handles the session check logic.
// By calling useSession() here, we guarantee it happens inside AuthProvider
export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // If session is null (not logged in), redirect to login
    if (!session) {
      router.replace('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      // Converted inline styles to Tailwind classes
      <div className="text-center mt-20 font-sans">
        Authenticating and Loading Dashboard...
      </div>
    );
  }

  // Only render the child content if the session is active
  if (session) {
    return <>{children}</>;
  }

  return null;
}