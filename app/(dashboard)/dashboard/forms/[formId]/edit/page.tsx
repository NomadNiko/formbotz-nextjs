'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, Spinner, Badge } from 'flowbite-react';
import {
  HiArrowLeft,
  HiSave,
  HiEye,
  HiGlobeAlt,
  HiPlus,
  HiClipboardList,
} from 'react-icons/hi';
import Link from 'next/link';
import { Form as IForm, Step } from '@/types';
import StepList from '@/components/builder/StepList';
import StepEditor from '@/components/builder/StepEditor';
import FormSettings from '@/components/builder/FormSettings';

export default function FormEditorPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<IForm | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`);
      const data = await response.json();

      if (response.ok) {
        setForm(data.form);
        if (data.form.steps && data.form.steps.length > 0) {
          setSelectedStepId(data.form.steps[0].id);
        }
      } else {
        setError(data.error || 'Failed to fetch form');
      }
    } catch {
      setError('Failed to fetch form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          steps: form.steps,
          settings: form.settings,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForm(data.form);
        setSuccessMessage('Form saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to save form');
      }
    } catch {
      setError('Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form) return;

    const action = form.status === 'published' ? 'unpublish' : 'publish';
    const confirmMessage =
      action === 'publish'
        ? 'Publish this form and make it available to users?'
        : 'Unpublish this form? It will no longer be accessible.';

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/forms/${formId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setForm(data.form);
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || `Failed to ${action} form`);
      }
    } catch {
      setError(`Failed to ${action} form`);
    }
  };

  const handleAddStep = (step: Step) => {
    if (!form) return;
    setForm({
      ...form,
      steps: [...form.steps, step],
    });
    setSelectedStepId(step.id);
  };

  const handleUpdateStep = (updatedStep: Step) => {
    if (!form) return;
    setForm({
      ...form,
      steps: form.steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)),
    });
  };

  const handleDeleteStep = (stepId: string) => {
    if (!form) return;
    const newSteps = form.steps.filter((s) => s.id !== stepId);
    setForm({
      ...form,
      steps: newSteps,
    });
    if (selectedStepId === stepId && newSteps.length > 0) {
      setSelectedStepId(newSteps[0].id);
    }
  };

  const handleReorderSteps = (reorderedSteps: Step[]) => {
    if (!form) return;
    setForm({
      ...form,
      steps: reorderedSteps,
    });
  };

  const selectedStep = form?.steps.find((s) => s.id === selectedStepId);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center">
        <p className="text-red-600">Form not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/forms">
            <Button color="light" size="sm">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {form.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {form.status === 'published' ? (
                <Badge color="success">Published</Badge>
              ) : (
                <Badge color="warning">Draft</Badge>
              )}
              <span className="text-sm text-gray-500">
                {form.steps.length} step{form.steps.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/chat/${form.publicUrl}`} target="_blank">
            <Button color="light" size="sm" disabled={!form.publicUrl}>
              <HiEye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Link href={`/dashboard/forms/${formId}/submissions`}>
            <Button color="gray" size="sm">
              <HiClipboardList className="mr-2 h-4 w-4" />
              Submissions
            </Button>
          </Link>
          <Button
            color={form.status === 'published' ? 'warning' : 'success'}
            size="sm"
            onClick={handlePublish}
            disabled={form.steps.length === 0}
          >
            <HiGlobeAlt className="mr-2 h-4 w-4" />
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button color="blue" size="sm" onClick={handleSave} disabled={isSaving}>
            <HiSave className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {/* Main Builder Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: Step List */}
        <div className="w-80 flex-shrink-0">
          <Card className="h-full overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Steps</h3>
                <Button size="xs" color="blue">
                  <HiPlus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <StepList
                  steps={form.steps}
                  selectedStepId={selectedStepId}
                  onSelectStep={setSelectedStepId}
                  onReorder={handleReorderSteps}
                  onDelete={handleDeleteStep}
                  onAdd={handleAddStep}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Center: Step Editor */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full overflow-y-auto">
            {selectedStep ? (
              <StepEditor key={selectedStep.id} step={selectedStep} onUpdate={handleUpdateStep} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                <div className="text-center">
                  <p>No step selected</p>
                  <p className="text-sm">Add a step to get started</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Settings/Preview */}
        <div className="w-80 flex-shrink-0">
          <Card className="h-full overflow-y-auto">
            <FormSettings
              settings={form.settings}
              onUpdate={(settings) => setForm({ ...form, settings })}
            />

            <div className="mt-6 border-t pt-6 dark:border-gray-700">
              <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                Form Info
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Public URL
                  </p>
                  <code className="mt-1 block rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                    /chat/{form.publicUrl}
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stats
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Views: {form.stats?.views || 0}</p>
                    <p>Starts: {form.stats?.starts || 0}</p>
                    <p>Completions: {form.stats?.completions || 0}</p>
                    <p>
                      Rate:{' '}
                      {form.stats?.completionRate?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
