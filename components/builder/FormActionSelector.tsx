'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Checkbox, Label, Spinner } from 'flowbite-react';
import { HiPlus, HiX } from 'react-icons/hi';
import { FormAction, FormActionType } from '@/types';

interface FormActionSelectorProps {
  selectedActionIds: string[];
  onUpdate: (actionIds: string[]) => void;
}

export default function FormActionSelector({
  selectedActionIds,
  onUpdate,
}: FormActionSelectorProps) {
  const [allActions, setAllActions] = useState<FormAction[]>([]);
  const [selectedActions, setSelectedActions] = useState<FormAction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch selected actions details
  const fetchSelectedActions = useCallback(async () => {
    try {
      const promises = selectedActionIds.map((id) =>
        fetch(`/api/form-actions/${id}`).then((res) => res.json())
      );
      const results = await Promise.all(promises);
      setSelectedActions(results.map((r) => r.formAction).filter(Boolean));
    } catch (err) {
      console.error('Error fetching selected actions:', err);
    }
  }, [selectedActionIds]);

  // Fetch all actions
  const fetchAllActions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/form-actions');
      const data = await response.json();
      setAllActions(data.formActions || []);
    } catch (err) {
      console.error('Error fetching actions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch all actions when modal opens
  useEffect(() => {
    if (modalOpen) {
      fetchAllActions();
    }
  }, [modalOpen]);

  // Effect to fetch selected actions details
  useEffect(() => {
    if (selectedActionIds.length > 0) {
      fetchSelectedActions();
    } else {
      setSelectedActions([]);
    }
  }, [selectedActionIds, fetchSelectedActions]);

  const handleToggleAction = (actionId: string) => {
    const newIds = selectedActionIds.includes(actionId)
      ? selectedActionIds.filter((id) => id !== actionId)
      : [...selectedActionIds, actionId];

    onUpdate(newIds);
  };

  const handleRemoveAction = (actionId: string) => {
    onUpdate(selectedActionIds.filter((id) => id !== actionId));
  };

  const getActionTypeBadge = (type: FormActionType) => {
    if (type === FormActionType.EMAIL) {
      return <Badge color="info" size="xs">Email</Badge>;
    } else if (type === FormActionType.API) {
      return <Badge color="purple" size="xs">API</Badge>;
    }
    return <Badge color="gray" size="xs">{type}</Badge>;
  };

  return (
    <div className="space-y-3">
      {/* Selected actions */}
      {selectedActions.length > 0 ? (
        <div className="space-y-2">
          {selectedActions.map((action) => (
            <div
              key={action._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                {getActionTypeBadge(action.type)}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.name}
                </span>
                {action.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    - {action.description}
                  </span>
                )}
              </div>
              <Button
                size="xs"
                color="failure"
                onClick={() => handleRemoveAction(action._id!)}
              >
                <HiX className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No actions selected
        </p>
      )}

      {/* Add action button */}
      <Button size="sm" color="light" onClick={() => setModalOpen(true)}>
        <HiPlus className="mr-2 h-4 w-4" />
        Add Action
      </Button>

      {/* Action selector modal */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>Select Form Actions</ModalHeader>
        <ModalBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="xl" />
            </div>
          ) : allActions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-500">
                No form actions available. Create one first.
              </p>
              <Button size="sm" onClick={() => window.location.href = '/dashboard/actions'}>
                Go to Actions Page
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {allActions.map((action) => (
                <div
                  key={action._id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <Checkbox
                    id={`action-${action._id}`}
                    checked={selectedActionIds.includes(action._id!)}
                    onChange={() => handleToggleAction(action._id!)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`action-${action._id}`}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {getActionTypeBadge(action.type)}
                        <span className="font-medium">{action.name}</span>
                      </div>
                      {action.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {action.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {action.type === FormActionType.EMAIL &&
                          'recipients' in action.config &&
                          `${action.config.recipients.length} recipient(s)`}
                        {action.type === FormActionType.API &&
                          'targetUrl' in action.config &&
                          `${action.config.method} to ${new URL(action.config.targetUrl).hostname}`}
                      </p>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setModalOpen(false)}>Done</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
