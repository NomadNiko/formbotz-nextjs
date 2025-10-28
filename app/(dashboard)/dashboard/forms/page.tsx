'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Badge, Table, Spinner, TableHead, TableBody, TableRow, TableCell, TableHeadCell, Dropdown, DropdownItem, DropdownDivider, Pagination } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash, HiEye, HiExternalLink, HiClipboardList, HiDuplicate, HiDotsVertical } from 'react-icons/hi';
import { Form as IForm } from '@/types';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 10;

export default function FormsListPage() {
  const router = useRouter();
  const [forms, setForms] = useState<IForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      const data = await response.json();

      if (response.ok) {
        setForms(data.forms);
      } else {
        setError(data.error || 'Failed to fetch forms');
      }
    } catch {
      setError('Failed to fetch forms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setForms(forms.filter((f) => f._id !== formId));
      } else {
        alert('Failed to delete form');
      }
    } catch {
      alert('Failed to delete form');
    }
  };

  const handleDuplicate = async (formId: string) => {
    setDuplicatingId(formId);

    try {
      const response = await fetch(`/api/forms/${formId}/duplicate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the forms list to show the new duplicate
        await fetchForms();
        // Navigate to edit the new form
        router.push(`/dashboard/forms/${data.form._id}/edit`);
      } else {
        alert(data.error || 'Failed to duplicate form');
      }
    } catch {
      alert('Failed to duplicate form');
    } finally {
      setDuplicatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge color="success">Published</Badge>;
      case 'draft':
        return <Badge color="warning">Draft</Badge>;
      case 'archived':
        return <Badge color="gray">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(forms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedForms = forms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Forms
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your conversational forms
          </p>
        </div>
        <Link href="/dashboard/forms/new">
          <Button color="blue">
            <HiPlus className="mr-2 h-5 w-5" />
            Create Form
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {forms.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HiEye className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No forms yet
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Get started by creating your first conversational form
            </p>
            <Link href="/dashboard/forms/new">
              <Button color="blue">
                <HiPlus className="mr-2 h-5 w-5" />
                Create Your First Form
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
            <Table hoverable>
                <TableHead>
                  <TableHeadCell>Name</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Steps</TableHeadCell>
                  <TableHeadCell>Form Actions</TableHeadCell>
                  <TableHeadCell>Submissions</TableHeadCell>
                  <TableHeadCell>Completion Rate</TableHeadCell>
                  <TableHeadCell>Last Updated</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {paginatedForms.map((form) => (
                  <TableRow
                    key={form._id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {form.displayName || form.name}
                    </TableCell>
                    <TableCell>{getStatusBadge(form.status)}</TableCell>
                    <TableCell>
                      {form.steps?.length || 0}
                    </TableCell>
                    <TableCell>
                      {form.formActions && form.formActions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {form.formActions.slice(0, 2).map((action: { name?: string } | string, idx) => {
                            const displayName = typeof action === 'object' && action?.name
                              ? action.name
                              : typeof action === 'string'
                              ? action
                              : 'Unknown';
                            return (
                              <Badge key={idx} color="info" size="sm">
                                {displayName}
                              </Badge>
                            );
                          })}
                          {form.formActions.length > 2 && (
                            <Badge color="gray" size="sm">
                              +{form.formActions.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {form.stats?.completions || 0} /{' '}
                      {form.stats?.starts || 0}
                    </TableCell>
                    <TableCell>
                      {form.stats?.completionRate
                        ? `${form.stats.completionRate.toFixed(1)}%`
                        : '0%'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(form.updatedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Dropdown
                        label=""
                        dismissOnClick={true}
                        renderTrigger={() => (
                          <button className="inline-flex items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                            <HiDotsVertical className="h-5 w-5" />
                          </button>
                        )}
                      >
                        <DropdownItem
                          icon={HiPencil}
                          onClick={() => router.push(`/dashboard/forms/${form._id}/edit`)}
                        >
                          Edit
                        </DropdownItem>
                        {form.status === 'published' && (
                          <DropdownItem
                            icon={HiExternalLink}
                            onClick={() => window.open(`/chat/${form.publicUrl}`, '_blank')}
                          >
                            View Live
                          </DropdownItem>
                        )}
                        <DropdownItem
                          icon={HiClipboardList}
                          onClick={() => router.push(`/dashboard/forms/${form._id}/submissions`)}
                        >
                          Submissions
                        </DropdownItem>
                        <DropdownItem
                          icon={HiDuplicate}
                          onClick={() => handleDuplicate(form._id!)}
                          disabled={duplicatingId === form._id}
                        >
                          {duplicatingId === form._id ? 'Duplicating...' : 'Duplicate'}
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem
                          icon={HiTrash}
                          onClick={() => handleDelete(form._id!)}
                        >
                          Delete
                        </DropdownItem>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
