'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Badge, Table, Spinner, TableHead, TableBody, TableRow, TableCell, TableHeadCell, TextInput, Select, Pagination } from 'flowbite-react';
import { HiSearch, HiTrash, HiExternalLink } from 'react-icons/hi';
import { Form } from '@/types';
import { format } from 'date-fns';

interface FormWithClient extends Form {
  client?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdminFormsPage() {
  const [forms, setForms] = useState<FormWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
    });

    const response = await fetch(`/api/admin/forms?${params}`);
    const data = await response.json();

    if (response.ok) {
      setForms(data.forms);
      setTotalPages(data.pagination.pages);
    }
    setLoading(false);
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchForms();
  }, [currentPage, search, statusFilter, fetchForms]);

  const handleDelete = async (formId: string, formName: string) => {
    if (!confirm(`Delete form "${formName}"? This will also delete all submissions.`)) return;

    const response = await fetch(`/api/admin/forms/${formId}?deleteSubmissions=true`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchForms();
    } else {
      alert('Failed to delete form');
    }
  };

  if (loading && forms.length === 0) {
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
          All Forms
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage forms across all users
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <TextInput
          icon={HiSearch}
          placeholder="Search forms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <Table hoverable>
          <TableHead>
            <TableHeadCell>Form Name</TableHeadCell>
            <TableHeadCell>Owner</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Steps</TableHeadCell>
            <TableHeadCell>Submissions</TableHeadCell>
            <TableHeadCell>Created</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {forms.map((form) => (
              <TableRow key={form._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  {form.displayName || form.name}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{form.client?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{form.client?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {form.status === 'published' && <Badge color="success">Published</Badge>}
                  {form.status === 'draft' && <Badge color="warning">Draft</Badge>}
                  {form.status === 'archived' && <Badge color="gray">Archived</Badge>}
                </TableCell>
                <TableCell>{form.steps?.length || 0}</TableCell>
                <TableCell>{form.stats?.starts || 0}</TableCell>
                <TableCell>{format(new Date(form.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {form.status === 'published' && (
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => window.open(`/chat/${form.publicUrl}`, '_blank')}
                      >
                        <HiExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleDelete(form._id!, form.displayName || form.name)}
                    >
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
    </div>
  );
}
