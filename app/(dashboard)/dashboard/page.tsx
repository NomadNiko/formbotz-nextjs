import Link from 'next/link';
import { Button, Card } from 'flowbite-react';
import { HiPlus, HiViewBoards, HiInbox } from 'react-icons/hi';
import { getCurrentUser } from '@/lib/auth/session';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your conversational forms and view submissions
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Forms
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
            <HiViewBoards className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Submissions
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
            <HiInbox className="h-12 w-12 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                0%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-300">
                %
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link href="/dashboard/forms/new">
              <Button color="blue" className="w-full">
                <HiPlus className="mr-2 h-5 w-5" />
                Create New Form
              </Button>
            </Link>
            <Link href="/dashboard/forms">
              <Button color="light" className="w-full">
                <HiViewBoards className="mr-2 h-5 w-5" />
                View All Forms
              </Button>
            </Link>
            <Link href="/dashboard/submissions">
              <Button color="light" className="w-full">
                <HiInbox className="mr-2 h-5 w-5" />
                View Submissions
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                1. Create Your First Form
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click "Create New Form" to start building your conversational form
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                2. Add Steps
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add questions, messages, and conditional logic to guide users
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                3. Share Your Form
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Publish and share your unique form URL with your audience
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
