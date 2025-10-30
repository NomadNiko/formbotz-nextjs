import Link from 'next/link';
import { Button, Badge } from 'flowbite-react';
import { HiUsers, HiViewBoards, HiInbox, HiCheckCircle, HiClock } from 'react-icons/hi';
import connectDB from '@/lib/db/mongodb';
import { User, Form, Submission } from '@/lib/db/models';
import { FormStatus, SubmissionStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await connectDB();

  const totalUsers = await User.countDocuments();
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const clientUsers = await User.countDocuments({ role: 'client' });

  const totalForms = await Form.countDocuments();
  const publishedForms = await Form.countDocuments({ status: FormStatus.PUBLISHED });
  const draftForms = await Form.countDocuments({ status: FormStatus.DRAFT });

  const totalSubmissions = await Submission.countDocuments();
  const completedSubmissions = await Submission.countDocuments({ status: SubmissionStatus.COMPLETED });

  const proUsers = await User.countDocuments({ 'subscription.plan': 'pro' });
  const enterpriseUsers = await User.countDocuments({ 'subscription.plan': 'enterprise' });

  const recentUsers = await User.find()
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            System-wide overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button color="purple">
              <HiUsers className="mr-2 h-5 w-5" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/forms">
            <Button color="blue">
              <HiViewBoards className="mr-2 h-5 w-5" />
              All Forms
            </Button>
          </Link>
          <Link href="/admin/submissions">
            <Button color="green">
              <HiInbox className="mr-2 h-5 w-5" />
              All Submissions
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalUsers}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-purple-600 dark:text-purple-400">
                  {adminUsers} admins
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {clientUsers} clients
                </span>
              </div>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <HiUsers className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Forms
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalForms}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-green-600 dark:text-green-400">
                  {publishedForms} published
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  {draftForms} draft
                </span>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <HiViewBoards className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Submissions
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalSubmissions}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {completedSubmissions} completed
              </div>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <HiInbox className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Paid Plans
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {proUsers + enterpriseUsers}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-blue-600 dark:text-blue-400">
                  {proUsers} pro
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-purple-600 dark:text-purple-400">
                  {enterpriseUsers} enterprise
                </span>
              </div>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
              <HiCheckCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Users
            </h2>
            <Link href="/admin/users">
              <Button color="light" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="py-12 text-center">
              <HiUsers className="mx-auto h-16 w-16 text-gray-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                No users yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div
                  key={String(user._id)}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-white dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </h3>
                        {user.role === 'admin' ? (
                          <Badge color="purple" size="xs">Admin</Badge>
                        ) : (
                          <Badge color="gray" size="xs">Client</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Badge color={user.subscription.plan === 'enterprise' ? 'purple' : user.subscription.plan === 'pro' ? 'blue' : 'gray'} size="xs">
                      {user.subscription.plan}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>

          <div className="py-12 text-center">
            <HiClock className="mx-auto h-16 w-16 text-gray-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
              Activity Tracking Coming Soon
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              User actions and system events will be displayed here
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          System Information
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Beta Mode Active
            </p>
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
              Subscription limits are not enforced. Users can create unlimited forms and submissions.
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Admin Panel
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              You can view and modify all user data, forms, and submissions. Changes to subscription limits will not affect current usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
