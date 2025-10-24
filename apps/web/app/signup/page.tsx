'use client'; // This is required for components with user interaction

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 1. Import shared UI components
import { Button } from '@repo/ui';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@repo/ui';
import { Input } from '@repo/ui';
import { AlertBox } from '@repo/ui';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Use null for no error
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('All fields are necessary.');
      return;
    }
    
    setLoading(true); // Set loading state

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // If signup is successful, redirect to the login page
        router.push('/login?signup=success'); // Optionally add query param
      } else {
        // If there's an error (like "User already exists"), show the message
        const data = await res.json();
        setError(data.message || 'Something went wrong.');
      }
    } catch (error: any) {
      setError('Error, please try again.');
      console.error(error);
    } finally {
      setLoading(false); // Unset loading state
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* 2. Use the Card component for the main container */}
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center p-6">
          <CardTitle className="text-3xl font-bold text-gray-800">Create an Account</CardTitle>
          <CardDescription className="pt-2 text-gray-500">
            Enter your details to register
          </CardDescription>
        </CardHeader>

        {/* 3. Use CardContent for the form */}
        <CardContent className="space-y-4 px-6 pb-6">
          {error && (
            // 4. Use the AlertBox component for errors
            <AlertBox type="error" message={error} onClose={() => setError(null)} />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="text-sm font-medium text-gray-700">Full Name</label>
              {/* 5. Use the Input component */}
              <Input 
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</label>
              {/* 6. Use the Input component */}
              <Input 
                id="signup-email" 
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</label>
              {/* 7. Use the Input component */}
              <Input 
                id="signup-password" 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>

            {/* 8. Submit Button */}
            <Button 
              type="submit"
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>

        {/* 9. Footer Section */}
        <CardFooter className="text-center border-t p-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
