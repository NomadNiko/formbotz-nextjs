'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Badge, Modal } from 'flowbite-react';
import { HiEye, HiClipboardList } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { SubmissionStatus } from '@/types';

interface SubmissionWithForm {
  _id: unknown;
  formId: unknown;
  status: SubmissionStatus;
  createdAt: Date;
  data?: Record<string, unknown>;
}

interface FormFromMap {
  _id: unknown;
  name: string;
  displayName?: string;
}

export default function SubmissionCard({ submission, form, isCompleted, isAbandoned }: {
  submission: SubmissionWithForm;
  form: FormFromMap | undefined;
  isCompleted: boolean;
  isAbandoned: boolean;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-white dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {form?.displayName || form?.name || 'Unknown Form'}
              </h3>
              {isCompleted && <Badge color="success" size="xs">Completed</Badge>}
              {isAbandoned && <Badge color="failure" size="xs">Abandoned</Badge>}
              {!isCompleted && !isAbandoned && <Badge color="warning" size="xs">In Progress</Badge>}
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
          <div className="flex items-center gap-1" data-tour="submission-actions">
            <Button color="light" size="xs" onClick={() => setShowModal(true)} aria-label="View submission details" data-tour="submission-view-btn">
              <HiEye className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">View Details</span>
            </Button>
            <Link href={`/dashboard/forms/${String(form?._id)}/submissions`} aria-label={`View all submissions for ${form?.displayName || form?.name}`}>
              <Button color="light" size="xs" data-tour="submission-all-btn">
                <HiClipboardList className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">All Submissions</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal show onClose={() => setShowModal(false)} size="lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Submission Details
              </h3>
              <Button color="gray" size="xs" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Form</p>
                <p className="text-gray-900 dark:text-white">{form?.displayName || form?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                <div className="mt-1">
                  {isCompleted && <Badge color="success">Completed</Badge>}
                  {isAbandoned && <Badge color="failure">Abandoned</Badge>}
                  {!isCompleted && !isAbandoned && <Badge color="warning">In Progress</Badge>}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted</p>
                <p className="text-gray-900 dark:text-white">
                  {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                </p>
              </div>
              {isCompleted && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Collected Data</p>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(submission.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
