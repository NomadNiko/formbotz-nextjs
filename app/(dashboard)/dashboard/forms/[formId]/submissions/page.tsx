'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Table, Spinner, Badge, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from 'flowbite-react';
import { HiArrowLeft, HiDownload } from 'react-icons/hi';
import { Submission } from '@/types';
import { format } from 'date-fns';

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formName, setFormName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/submissions`);
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions);
        setFormName(data.form.name);
      } else {
        setError(data.error || 'Failed to fetch submissions');
      }
    } catch {
      setError('Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (submissions.length === 0) return;

    // Get all unique keys from submissions
    const allKeys = new Set<string>();
    submissions.forEach((sub) => {
      Object.keys(sub.data).forEach((key) => allKeys.add(key));
    });

    // Create CSV header
    const headers = ['Submission ID', 'Status', 'Started At', 'Completed At', ...Array.from(allKeys)];
    const csvRows = [headers.join(',')];

    // Add data rows
    submissions.forEach((sub) => {
      const row = [
        sub._id,
        sub.status,
        format(new Date(sub.metadata.startedAt), 'yyyy-MM-dd HH:mm:ss'),
        sub.metadata.completedAt
          ? format(new Date(sub.metadata.completedAt), 'yyyy-MM-dd HH:mm:ss')
          : 'In Progress',
        ...Array.from(allKeys).map((key) => {
          const value = sub.data[key];
          // Escape commas and quotes in values
          if (value === undefined || value === null) return '';
          const strValue = String(value);
          if (strValue.includes(',') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        }),
      ];
      csvRows.push(row.join(','));
    });

    // Create and download file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formName}-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/forms/${formId}/edit`}>
            <Button color="light" size="sm">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Submissions
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{formName}</p>
          </div>
        </div>
        <Button color="blue" onClick={exportToCSV} disabled={submissions.length === 0}>
          <HiDownload className="mr-2 h-5 w-5" />
          Export CSV
        </Button>
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
              No submissions yet
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Submitted</TableHeadCell>
                <TableHeadCell>Data</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {submissions.map((submission) => (
                  <TableRow
                    key={submission._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
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
                        ? format(new Date(submission.metadata.completedAt), 'MMM d, yyyy HH:mm')
                        : format(new Date(submission.metadata.startedAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
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
