import Link from 'next/link';
import { Button, Badge, Progress } from 'flowbite-react';
import {
  HiPlus,
  HiViewBoards,
  HiInbox,
  HiTrendingUp,
  HiPencilAlt,
  HiEye,
  HiClipboardList,
  HiChartBar,
  HiCheckCircle,
  HiClock,
  HiX,
} from 'react-icons/hi';
import { getCurrentUser } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import { Form, Submission } from '@/lib/db/models';
import { FormStatus, SubmissionStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface FormWithStats {
  _id: unknown;
  name: string;
  displayName?: string;
  status: FormStatus;
  steps: unknown[];
  updatedAt: Date;
  publicUrl: string;
  submissionCount: number;
  completedCount: number;
  realCompletionRate: number;
}

interface SubmissionWithForm {
  _id: unknown;
  formId: unknown;
  status: SubmissionStatus;
  createdAt: Date;
  data?: Record<string, unknown>;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  await connectDB();

  // Fetch all user's forms for calculations
  const allForms = await Form.find({ clientId: user?.id })
    .sort({ updatedAt: -1 })
    .lean();

  const allFormIds = allForms.map(f => f._id);

  // Fetch all submissions for accurate stats
  const allSubmissions = await Submission.find({
    formId: { $in: allFormIds }
  }).lean();

  // Calculate accurate stats from real data
  const totalForms = allForms.length;
  const publishedForms = allForms.filter(f => f.status === FormStatus.PUBLISHED).length;
  const draftForms = allForms.filter(f => f.status === FormStatus.DRAFT).length;

  const totalSubmissions = allSubmissions.length;
  const completedSubmissions = allSubmissions.filter(s => s.status === SubmissionStatus.COMPLETED).length;
  const inProgressSubmissions = allSubmissions.filter(s => s.status === SubmissionStatus.IN_PROGRESS).length;

  // Real completion rate from actual submissions
  const completionRate = totalSubmissions > 0
    ? Math.round((completedSubmissions / totalSubmissions) * 100)
    : 0;

  // Calculate average completion time (for completed submissions only)
  const completedWithTime = allSubmissions.filter(s =>
    s.status === SubmissionStatus.COMPLETED &&
    s.metadata?.startedAt &&
    s.metadata?.completedAt
  );

  let avgCompletionTime = 0;
  if (completedWithTime.length > 0) {
    const totalTime = completedWithTime.reduce((sum, s) => {
      const start = new Date(s.metadata.startedAt).getTime();
      const end = new Date(s.metadata.completedAt!).getTime();
      return sum + (end - start);
    }, 0);
    avgCompletionTime = Math.round(totalTime / completedWithTime.length / 1000); // in seconds
  }

  // Format average time nicely
  const formatAvgTime = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSubmissions = allSubmissions.filter(s =>
    new Date(s.createdAt).getTime() >= sevenDaysAgo.getTime()
  );
  const recentCompletions = recentSubmissions.filter(s => s.status === SubmissionStatus.COMPLETED).length;

  // Get top 5 recent submissions
  const latestSubmissions = allSubmissions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Create form map for lookups
  const formMap = new Map(
    allForms.map(form => [String(form._id), form])
  );

  // Calculate per-form stats
  const formStats = allForms.map(form => {
    const formSubmissions = allSubmissions.filter(s => String(s.formId) === String(form._id));
    const formCompleted = formSubmissions.filter(s => s.status === SubmissionStatus.COMPLETED).length;
    const formTotal = formSubmissions.length;
    const formCompletionRate = formTotal > 0 ? Math.round((formCompleted / formTotal) * 100) : 0;

    return {
      ...form,
      submissionCount: formTotal,
      completedCount: formCompleted,
      realCompletionRate: formCompletionRate,
    };
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {totalForms > 0
              ? `You have ${totalForms} form${totalForms !== 1 ? 's' : ''} and ${totalSubmissions} submission${totalSubmissions !== 1 ? 's' : ''}`
              : "Get started by creating your first form"
            }
          </p>
        </div>
        <Link href="/dashboard/forms/new">
          <Button color="blue" size="lg">
            <HiPlus className="mr-2 h-5 w-5" />
            Create Form
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Forms */}
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

        {/* Total Submissions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Submissions
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalSubmissions}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="text-green-600 dark:text-green-400">
                  {completedSubmissions} completed
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-yellow-600 dark:text-yellow-400">
                  {inProgressSubmissions} incomplete
                </span>
              </div>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <HiInbox className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {completionRate}%
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Avg time: {formatAvgTime(avgCompletionTime)}
              </div>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
              <HiChartBar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Last 7 Days */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Last 7 Days
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {recentSubmissions.length}
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {recentCompletions} completed
              </div>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
              <HiTrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Forms */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Forms
            </h2>
            <Link href="/dashboard/forms">
              <Button color="light" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {formStats.length === 0 ? (
            <div className="py-12 text-center">
              <HiViewBoards className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                No forms yet
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Create your first form to get started!
              </p>
              <Link href="/dashboard/forms/new">
                <Button color="blue" size="sm" className="mt-4">
                  <HiPlus className="mr-2 h-4 w-4" />
                  Create Form
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {formStats.map((form: FormWithStats) => (
                <div
                  key={String(form._id)}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900/50"
                >
                  {/* Form Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {form.displayName || form.name}
                        </h3>
                        {form.status === FormStatus.PUBLISHED ? (
                          <Badge color="success" size="sm">Published</Badge>
                        ) : (
                          <Badge color="warning" size="sm">Draft</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Form Stats */}
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded bg-white p-2 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Steps</p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {form.steps?.length || 0}
                      </p>
                    </div>
                    <div className="rounded bg-white p-2 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Submissions</p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {form.submissionCount}
                      </p>
                    </div>
                    <div className="rounded bg-white p-2 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {form.completedCount}
                      </p>
                    </div>
                  </div>

                  {/* Completion Rate Bar */}
                  {form.submissionCount > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {form.realCompletionRate}%
                        </span>
                      </div>
                      <Progress
                        progress={form.realCompletionRate}
                        size="sm"
                        color={form.realCompletionRate >= 70 ? 'green' : form.realCompletionRate >= 40 ? 'yellow' : 'red'}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <Link href={`/dashboard/forms/${String(form._id)}/edit`} className="flex-1">
                      <Button color="light" size="xs" className="w-full">
                        <HiPencilAlt className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/chat/${form.publicUrl}`} target="_blank">
                      <Button color="light" size="xs">
                        <HiEye className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/forms/${String(form._id)}/submissions`}>
                      <Button color="light" size="xs">
                        <HiClipboardList className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Submissions
            </h2>
            <Link href="/dashboard/submissions">
              <Button color="light" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {latestSubmissions.length === 0 ? (
            <div className="py-12 text-center">
              <HiInbox className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                No submissions yet
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Share your forms to start collecting responses!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestSubmissions.map((submission: SubmissionWithForm) => {
                const form = formMap.get(String(submission.formId));
                const isCompleted = submission.status === SubmissionStatus.COMPLETED;
                const isAbandoned = submission.status === SubmissionStatus.ABANDONED;

                return (
                  <div
                    key={String(submission._id)}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-white dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {form?.displayName || form?.name || 'Unknown Form'}
                          </p>
                          {isCompleted && (
                            <HiCheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" title="Completed" />
                          )}
                          {isAbandoned && (
                            <HiX className="h-4 w-4 text-red-600 flex-shrink-0" title="Abandoned" />
                          )}
                          {!isCompleted && !isAbandoned && (
                            <HiClock className="h-4 w-4 text-yellow-600 flex-shrink-0" title="Incomplete" />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}</span>
                          {isCompleted && (
                            <>
                              <span>•</span>
                              <span>{Object.keys(submission.data || {}).length} fields</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2">
                      {isCompleted && (
                        <Badge color="success" size="xs">Completed</Badge>
                      )}
                      {isAbandoned && (
                        <Badge color="failure" size="xs">Abandoned</Badge>
                      )}
                      {!isCompleted && !isAbandoned && (
                        <Badge color="warning" size="xs">Incomplete</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Guide (only for new users) */}
      {totalForms === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Getting Started with FormBotz
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <HiPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                1. Create Your First Form
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Build a conversational form in minutes with our intuitive step-by-step builder
              </p>
              <Link href="/dashboard/forms/new">
                <Button color="blue" size="sm">
                  Create Form
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <HiViewBoards className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                2. Add Steps & Logic
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create dynamic forms with conditional branching and variable collection
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <HiTrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                3. Share & Collect
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Publish your form and start collecting responses from your audience
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
