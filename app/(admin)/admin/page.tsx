import Link from 'next/link';
import { Button } from 'flowbite-react';
import { HiUsers, HiViewBoards, HiInbox, HiCheckCircle } from 'react-icons/hi';
import connectDB from '@/lib/db/mongodb';
import { User, Form, Submission } from '@/lib/db/models';
import { FormStatus, SubmissionStatus } from '@/types';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            System-wide overview and management
          </p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/admin/users">
              <Button color="purple" className="w-full">
                <HiUsers className="mr-2 h-5 w-5" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/forms">
              <Button color="blue" className="w-full">
                <HiViewBoards className="mr-2 h-5 w-5" />
                View All Forms
              </Button>
            </Link>
            <Link href="/admin/submissions">
              <Button color="green" className="w-full">
                <HiInbox className="mr-2 h-5 w-5" />
                View All Submissions
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            System Information
          </h2>
          <div className="space-y-3">
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
    </div>
  );
}
