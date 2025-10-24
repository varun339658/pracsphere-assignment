import './globals.css'; // <-- You have this import, which is correct!
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '../components/AuthProvider'; // Assuming this provides the NextAuth session

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
 title: 'PracSphere Assignment',
 description: 'Built by Varun Reddy',
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en">
   {/* Applying font and a base background color here */}
   <body className={`${inter.className} bg-gray-100`}>
    {/* AuthProvider wraps the content */}
    <AuthProvider>{children}</AuthProvider>
   </body>
  </html>
 );
}