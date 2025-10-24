// File: apps/web/app/page.tsx
'use client'; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to the login page on load
    // The login page handles the session status from there.
    router.replace('/login');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem', fontFamily: 'sans-serif' }}>
      Loading Application...
    </div>
  );
}