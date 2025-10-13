import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from 'flowbite-react';
import { getCurrentUser } from '@/lib/auth/session';

export default async function Home() {
  const user = await getCurrentUser();

  // Redirect to dashboard if authenticated
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-24 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white md:text-6xl">
          FormBotz
        </h1>
        <p className="mb-4 text-2xl font-light text-gray-700 dark:text-gray-300 md:text-3xl">
          Create Conversational Forms That Feel Like Chat
        </p>
        <p className="mb-12 text-lg text-gray-600 dark:text-gray-400">
          Build engaging forms that guide users through questions one at a time,
          making data collection feel natural and human.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/register">
            <Button size="xl" color="blue">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="xl" color="light">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">💬</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Conversational Flow
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Present questions one at a time in a chat-like interface for better engagement
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">🎯</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Smart Logic
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Branch questions based on answers with powerful conditional logic
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">📊</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Easy Data Export
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              View submissions in a dashboard and export to CSV with one click
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
