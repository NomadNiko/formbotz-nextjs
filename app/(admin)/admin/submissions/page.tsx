'use client';

import { useEffect, useState } from 'react';
import { Button, Badge, Table, Spinner, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Select, Pagination } from 'flowbite-react';
import { Modal } from 'flowbite-react';
import { HiTrash, HiEye } from 'react-icons/hi';
import { Submission } from '@/types';
import { format } from 'date-fns';

interface SubmissionWithDetails extends Submission {
  form?: {
    _id: string;
    name: string;
  };
  client?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingSubmission, setViewingSubmission] = useState<SubmissionWithDetails | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
      ...(statusFilter && { status: statusFilter }),
    });

    const response = await fetch(`/api/admin/submissions?${params}`);
    const data = await response.json();

    if (response.ok) {
      setSubmissions(data.submissions);
      setTotalPages(data.pagination.pages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, statusFilter]);

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Delete this submission? This action cannot be undone.')) return;

    const response = await fetch(`/api/admin/submissions/${submissionId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchSubmissions();
    } else {
      alert('Failed to delete submission');
    }
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          All Submissions
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage submissions across all forms
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="abandoned">Abandoned</option>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <Table hoverable>
          <TableHead>
            <TableHeadCell>Form Name</TableHeadCell>
            <TableHeadCell>Owner</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Fields</TableHeadCell>
            <TableHeadCell>Submitted</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {submissions.map((submission) => (
              <TableRow key={submission._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  {submission.form?.name || 'Unknown Form'}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{submission.client?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{submission.client?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {submission.status === 'completed' && <Badge color="success">Completed</Badge>}
                  {submission.status === 'in-progress' && <Badge color="warning">In Progress</Badge>}
                  {submission.status === 'abandoned' && <Badge color="failure">Abandoned</Badge>}
                </TableCell>
                <TableCell>{Object.keys(submission.data || {}).length}</TableCell>
                <TableCell>{format(new Date(submission.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => setViewingSubmission(submission)}>
                      <HiEye className="h-4 w-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => handleDelete(submission._id!)}>
                      <HiTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
          />
        </div>
      )}

      {viewingSubmission && (
        <Modal show onClose={() => setViewingSubmission(null)} size="lg">
          <div className="p-6">
            <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
              Submission Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Form</p>
                <p className="text-gray-900 dark:text-white">{viewingSubmission.form?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Owner</p>
                <p className="text-gray-900 dark:text-white">
                  {viewingSubmission.client?.name} ({viewingSubmission.client?.email})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                <p className="text-gray-900 dark:text-white">{viewingSubmission.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Collected Data</p>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(viewingSubmission.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
