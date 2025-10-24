'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 1. Import shared UI components
import { Button } from '@repo/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@repo/ui';
import { Input } from '@repo/ui';
import { AlertBox } from '@repo/ui';

// 2. Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.48-1.98 3.24v2.7h3.48c2.04-1.87 3.22-4.75 3.22-8.01z"></path>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.48-2.7c-.98.66-2.23 1.06-3.8 1.06-2.9 0-5.38-1.96-6.26-4.6H2.26v2.79C4.1 20.29 7.7 23 12 23z"></path>
    <path fill="currentColor" d="M5.74 14.09c-.23-.66-.35-1.36-.35-2.09s.12-1.43.35-2.09V7.21H2.26C1.46 8.75 1 10.32 1 12s.46 3.25 1.26 4.79l3.48-2.7z"></path>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.09-3.09C17.46 2.09 14.97 1 12 1 7.7 1 4.1 3.71 2.26 7.21l3.48 2.79c.88-2.64 3.36-4.6 6.26-4.6z"></path>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Use null for no error
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Set loading
    
    const result = await signIn('credentials', {
      redirect: false,
      email: email,
      password: password,
    });

    setLoading(false); // Unset loading
    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.replace('/dashboard'); // Use replace to avoid back button issues
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* 3. Use the Card component for the main container */}
      <Card className="w-full max-w-md shadow-lg"> {/* Added shadow-lg */}
        <CardHeader className="text-center p-6"> {/* Added padding */}
          <CardTitle className="text-3xl font-bold text-gray-800">Welcome Back</CardTitle>
          <CardDescription className="pt-2 text-gray-500">Sign in to your account</CardDescription>
        </CardHeader>
        
        {/* 4. Use CardContent for the form */}
        <CardContent className="space-y-4 px-6 pb-6"> {/* Added padding */}
          {error && (
            // 5. Use the AlertBox component for errors
            <AlertBox type="error" message={error} onClose={() => setError(null)} />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</label>
              {/* 6. Use the Input component */}
              <Input 
                id="login-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
                disabled={loading} // Disable when loading
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</label>
              {/* 7. Use the Input component */}
              <Input 
                id="login-password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                disabled={loading} // Disable when loading
              />
            </div>
            {/* 8. Use the Button component */}
            <Button 
              type="submit" 
              className="w-full" // Use Tailwind for width
              disabled={loading} // Disable when loading
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-semibold">OR</span>
            </div>
          </div>

          {/* 9. Use the Button component for Google Sign-In */}
          <Button 
            variant="outline" // Use outline style
            className="w-full" // Use Tailwind for width
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            disabled={loading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </CardContent>
        
        {/* 10. Use CardFooter for the sign up link */}
        <CardFooter className="p-6 pt-4">
           <p className="w-full text-center text-sm text-gray-600">
             Don't have an account?{' '}
             <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
               Sign up
             </Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}