'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, Spinner, Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { FormAction, FormActionType } from '@/types';
import FormActionEditor from '@/components/builder/FormActionEditor';

export default function ActionsPage() {
  const [formActions, setFormActions] = useState<FormAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<FormAction | null>(null);
  const [error, setError] = useState('');

  // Fetch form actions
  useEffect(() => {
    fetchFormActions();
  }, []);

  const fetchFormActions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/form-actions');

      if (!response.ok) {
        throw new Error('Failed to fetch form actions');
      }

      const data = await response.json();
      setFormActions(data.formActions || []);
    } catch (err) {
      console.error('Error fetching form actions:', err);
      setError('Failed to load form actions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAction(null);
    setEditorOpen(true);
  };

  const handleEdit = (action: FormAction) => {
    setEditingAction(action);
    setEditorOpen(true);
  };

  const handleDelete = async (actionId: string) => {
    if (!confirm('Delete this form action? It will be removed from all forms using it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/form-actions/${actionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete form action');
      }

      // Refresh list
      fetchFormActions();
    } catch (err) {
      console.error('Error deleting form action:', err);
      alert('Failed to delete form action');
    }
  };

  const handleSave = () => {
    setEditorOpen(false);
    fetchFormActions();
  };

  const getActionTypeBadge = (type: FormActionType) => {
    if (type === FormActionType.EMAIL) {
      return <Badge color="info">Email</Badge>;
    } else if (type === FormActionType.API) {
      return <Badge color="purple">API</Badge>;
    }
    return <Badge color="gray">{type}</Badge>;
  };

  const getActionDetails = (action: FormAction) => {
    if (action.type === FormActionType.EMAIL && 'recipients' in action.config) {
      const recipients = action.config.recipients;
      return `${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`;
    } else if (action.type === FormActionType.API && 'targetUrl' in action.config) {
      const method = action.config.method || 'POST';
      const url = new URL(action.config.targetUrl);
      return `${method} ${url.hostname}`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Form Actions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automate tasks when forms are completed
          </p>
        </div>
        <Button onClick={handleCreate}>
          <HiPlus className="mr-2 h-5 w-5" />
          Create Action
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {formActions.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No form actions yet
          </h3>
          <p className="mb-4 text-gray-500 dark:text-gray-400">
            Create your first action to automate email notifications or webhook calls when forms are completed.
          </p>
          <Button onClick={handleCreate}>
            <HiPlus className="mr-2 h-5 w-5" />
            Create First Action
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Type</TableHeadCell>
              <TableHeadCell>Details</TableHeadCell>
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>
                <span className="sr-only">Actions</span>
              </TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {formActions.map((action) => (
                <TableRow
                  key={action._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {action.name}
                  </TableCell>
                  <TableCell>
                    {getActionTypeBadge(action.type)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {getActionDetails(action)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => handleEdit(action)}
                      >
                        <HiPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        color="failure"
                        onClick={() => handleDelete(action._id!)}
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
      )}

      {editorOpen && (
        <FormActionEditor
          action={editingAction}
          onSave={handleSave}
          onCancel={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
