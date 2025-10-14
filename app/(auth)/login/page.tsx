'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Label, TextInput, Alert } from 'flowbite-react';
import { HiMail, HiLockClosed, HiInformationCircle } from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            FormBotz
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <Alert color="failure" icon={HiInformationCircle}>
                {error}
              </Alert>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email">Email</Label>
              </div>
              <TextInput
                id="email"
                type="email"
                icon={HiMail}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password">Password</Label>
              </div>
              <TextInput
                id="password"
                type="password"
                icon={HiLockClosed}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Sign up
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
