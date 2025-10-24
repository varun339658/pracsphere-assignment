"use client"; // This component uses hooks, so it must be a Client Component

import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from "@repo/ui"; // Import the (now dumber) Sidebar
import Link from "next/link"; // Import Link component HERE
import { usePathname, useRouter, useSelectedLayoutSegment, redirect } from "next/navigation"; // Import usePathname HERE
import { signOut, useSession } from "next-auth/react";

// --- Inline SVG Icons for Links (Now defined in the layout) ---
const DashboardIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>);
const TasksIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 14 2 2 4-4"></path></svg>);
const ProfileIcon = () => (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);

// --- Link Component (Now defined inside the layout) ---
type SidebarLinkProps = { href: string; pathname: string; icon: React.ReactNode; children: React.ReactNode; };
function SidebarLink({ href, pathname, icon, children }: SidebarLinkProps) {
  const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
        isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

// Helper to get title
function getPageTitle(segment: string | null): string {
  if (!segment) return "Dashboard";
  switch(segment) {
    case 'tasks': return 'Task Manager';
    case 'profile': return 'My Profile';
    default: return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}

// --- Dashboard Layout Component ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const pageTitle = getPageTitle(segment);

  // Effect 1: Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") { router.push('/login'); }
  }, [status, router]);

  // Effect 2: Fetch profile picture
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      const userEmail = session.user.email;
      const sessionImageFallback = session.user.image || null;
      const fetchProfilePicture = async () => {
        try {
          const res = await fetch(`/api/user/profile-picture?email=${encodeURIComponent(userEmail)}`);
          if (res.ok) {
            const data = await res.json(); setProfileImage(data.profileImage || sessionImageFallback);
          } else { setProfileImage(sessionImageFallback); }
        } catch (err) { setProfileImage(sessionImageFallback); }
      };
      fetchProfilePicture();
    } else if (status === 'unauthenticated') { setProfileImage(null); }
  }, [session, status]);

  // Handlers
  const handleLogout = () => signOut({ callbackUrl: '/login' });
  const handleViewProfile = () => router.push('/dashboard/profile');

  // Loading State
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-gray-600 text-sm font-medium">Loading session...</p>
      </div>
    );
  }

  // Render Layout (Only if Authenticated)
  if (status === "authenticated" && session) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        
        {/* Pass onLogout prop, and pass links as CHILDREN */}
        <Sidebar onLogout={handleLogout}>
          <SidebarLink href="/dashboard" pathname={pathname} icon={<DashboardIcon />}>Dashboard</SidebarLink>
          <SidebarLink href="/dashboard/tasks" pathname={pathname} icon={<TasksIcon />}>Tasks</SidebarLink>
          <SidebarLink href="/dashboard/profile" pathname={pathname} icon={<ProfileIcon />}>Profile</SidebarLink>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar
            userName={session.user?.name} userEmail={session.user?.email} profileImage={profileImage}
            onLogout={handleLogout} onViewProfile={handleViewProfile} pageTitle={pageTitle}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return null; // Fallback
}