'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Table, Spinner, Badge, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownItem } from 'flowbite-react';
import { HiArrowLeft, HiEye } from 'react-icons/hi';
import { Submission } from '@/types';
import { format } from 'date-fns';

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formName, setFormName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const exportToJSON = () => {
    if (submissions.length === 0) return;

    // Format submissions for export
    const exportData = submissions.map((sub) => ({
      submissionId: sub._id,
      status: sub.status,
      startedAt: format(new Date(sub.metadata.startedAt), 'yyyy-MM-dd HH:mm:ss'),
      completedAt: sub.metadata.completedAt
        ? format(new Date(sub.metadata.completedAt), 'yyyy-MM-dd HH:mm:ss')
        : null,
      data: sub.data,
    }));

    // Create pretty formatted JSON
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formName}-submissions-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
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
        <Dropdown
          label="Export"
          color="blue"
          disabled={submissions.length === 0}
        >
          <DropdownItem onClick={exportToCSV}>
            Export as CSV
          </DropdownItem>
          <DropdownItem onClick={exportToJSON}>
            Export as JSON
          </DropdownItem>
        </Dropdown>
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
                <TableHeadCell>Preview</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
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
                      <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                        {Object.keys(submission.data).length} fields
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="light"
                        size="xs"
                        onClick={() => handleViewSubmission(submission)}
                      >
                        <HiEye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Submission Detail Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="2xl">
        <ModalHeader>
          Submission Details
        </ModalHeader>
        <ModalBody>
          {selectedSubmission && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <p className="mt-1">
                    {selectedSubmission.status === 'completed' ? (
                      <Badge color="success">Completed</Badge>
                    ) : selectedSubmission.status === 'in-progress' ? (
                      <Badge color="warning">In Progress</Badge>
                    ) : (
                      <Badge color="gray">Abandoned</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Submission ID
                  </p>
                  <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                    {selectedSubmission._id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Started At
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {format(new Date(selectedSubmission.metadata.startedAt), 'MMM d, yyyy HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completed At
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedSubmission.metadata.completedAt
                      ? format(new Date(selectedSubmission.metadata.completedAt), 'MMM d, yyyy HH:mm:ss')
                      : 'In Progress'}
                  </p>
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Form Data
                </h3>
                <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  {Object.entries(selectedSubmission.data).length > 0 ? (
                    Object.entries(selectedSubmission.data).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-100 pb-2 last:border-0 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {key}
                        </p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {value === null || value === undefined
                            ? '(empty)'
                            : typeof value === 'boolean'
                            ? value ? 'Yes' : 'No'
                            : String(value)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No data collected yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
