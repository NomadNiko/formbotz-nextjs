'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Table,
  Spinner,
  Badge,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from 'flowbite-react';
import { HiEye } from 'react-icons/hi';
import { format } from 'date-fns';

interface SubmissionWithForm {
  _id: string;
  formId: string;
  formName: string;
  status: string;
  data: Record<string, unknown>;
  metadata: {
    startedAt: string;
    completedAt?: string;
  };
}

export default function AllSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
      } else {
        setError(data.error || 'Failed to fetch submissions');
      }
    } catch {
      setError('Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          All Submissions
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          View submissions from all your forms
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No submissions yet. Create and publish a form to start collecting
              data!
            </p>
            <Link href="/dashboard/forms/new">
              <Button color="blue" className="mt-4">
                Create Your First Form
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeadCell>Form</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Submitted</TableHeadCell>
                <TableHeadCell>Data Preview</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {submissions.map((submission) => (
                  <TableRow
                    key={submission._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <TableCell className="font-medium">
                      {submission.formName}
                    </TableCell>
                    <TableCell>
                      {submission.status === 'completed' ? (
                        <Badge color="success">Completed</Badge>
                      ) : submission.status === 'in-progress' ? (
                        <Badge color="warning">In Progress</Badge>
                      ) : (
                        <Badge color="gray">Abandoned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.metadata.completedAt
                        ? format(
                            new Date(submission.metadata.completedAt),
                            'MMM d, yyyy HH:mm'
                          )
                        : format(
                            new Date(submission.metadata.startedAt),
                            'MMM d, yyyy HH:mm'
                          )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {Object.entries(submission.data)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key} className="truncate text-sm">
                              <span className="font-medium">{key}:</span>{' '}
                              {String(value)}
                            </div>
                          ))}
                        {Object.keys(submission.data).length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{Object.keys(submission.data).length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/forms/${submission.formId}/submissions`}
                      >
                        <Button size="xs" color="light">
                          <HiEye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
