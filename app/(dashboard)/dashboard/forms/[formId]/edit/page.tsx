'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, Spinner, Badge, Modal, Label, TextInput } from 'flowbite-react';
import {
  HiArrowLeft,
  HiSave,
  HiEye,
  HiGlobeAlt,
  HiPlus,
  HiClipboardList,
  HiChevronLeft,
  HiChevronRight,
  HiPencil,
} from 'react-icons/hi';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Form as IForm, Step, StepType } from '@/types';
import StepList from '@/components/builder/StepList';
import StepEditor from '@/components/builder/StepEditor';
import FormSettings from '@/components/builder/FormSettings';
import WidgetSettings from '@/components/builder/WidgetSettings';
import EmbedCodeDisplay from '@/components/builder/EmbedCodeDisplay';
import { getStepTypeLabel, getStepIcon, createStepTemplate, validateAndFixReplayTargets } from '@/lib/utils/stepHelpers';
import { getAvailableVariables, validateFormConditionalLogic, validateMessageVariables } from '@/lib/utils/formValidation';

export default function FormEditorPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<IForm | null>(null);
  const [originalForm, setOriginalForm] = useState<IForm | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [showAddStepMenu, setShowAddStepMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'form' | 'widget'>('form');

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
        setOriginalForm(JSON.parse(JSON.stringify(data.form)));
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

    // Validate conditional logic before saving
    const validation = validateFormConditionalLogic(form.steps);
    if (!validation.isValid) {
      setError('Please check conditional logic in all steps. Some steps reference variables that haven\'t been collected yet.');
      setIsSaving(false);
      // Auto-scroll to error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate and fix replay targets
    const { steps: fixedSteps, errors: replayErrors } = validateAndFixReplayTargets(form.steps);

    // Validate message variables (non-blocking warnings)
    const { warnings: messageWarnings } = validateMessageVariables(fixedSteps);

    // Collect all warnings to show to user
    const allWarnings: string[] = [];
    if (replayErrors.length > 0) {
      allWarnings.push('Replay target issues found and fixed:');
      allWarnings.push(...replayErrors.map(e => `  • ${e}`));
    }
    if (messageWarnings.length > 0) {
      if (allWarnings.length > 0) allWarnings.push(''); // Add blank line
      allWarnings.push('Variable warnings in message text:');
      allWarnings.push(...messageWarnings.map(w => `  • ${w}`));
    }

    // Show warnings if any (but continue saving)
    if (allWarnings.length > 0) {
      setError(allWarnings.join('\n'));
      // Update form with fixed steps
      setForm({ ...form, steps: fixedSteps });
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          displayName: form.displayName,
          description: form.description,
          steps: fixedSteps,
          settings: form.settings,
          formActions: form.formActions || [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForm(data.form);
        setOriginalForm(JSON.parse(JSON.stringify(data.form)));
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

  const handleAddStep = (type: StepType) => {
    if (!form) return;
    const newStep = createStepTemplate(type, form.steps.length);
    setForm({
      ...form,
      steps: [...form.steps, newStep],
    });
    setSelectedStepId(newStep.id);
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

    // Filter out the deleted step
    const filteredSteps = form.steps.filter((s) => s.id !== stepId);

    // Update order numbers (replay targets by ID remain valid)
    const reorderedSteps = filteredSteps.map((step, index) => ({
      ...step,
      order: index,
    }));

    setForm({
      ...form,
      steps: reorderedSteps,
    });

    if (selectedStepId === stepId && reorderedSteps.length > 0) {
      setSelectedStepId(reorderedSteps[0].id);
    }
  };

  const handleReorderSteps = (reorderedSteps: Step[]) => {
    if (!form) return;
    setForm({
      ...form,
      steps: reorderedSteps,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !form) return;

    const oldIndex = form.steps.findIndex((step) => step.id === active.id);
    const newIndex = form.steps.findIndex((step) => step.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedSteps = arrayMove(form.steps, oldIndex, newIndex).map(
        (step, index) => ({ ...step, order: index })
      );
      handleReorderSteps(reorderedSteps);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenRenameModal = () => {
    setNewFormName(form?.name || '');
    setShowRenameModal(true);
  };

  const handleRename = async () => {
    if (!form || !newFormName.trim()) return;

    setIsRenaming(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/forms/${formId}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFormName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setForm(data.form);
        setShowRenameModal(false);
        setSuccessMessage('Form renamed successfully! The public URL has been updated.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to rename form');
      }
    } catch {
      setError('Failed to rename form');
    } finally {
      setIsRenaming(false);
    }
  };

  const selectedStep = form?.steps.find((s) => s.id === selectedStepId);

  // Calculate available variables for the selected step
  const selectedStepIndex = form?.steps.findIndex((s) => s.id === selectedStepId) ?? -1;
  const availableVariables = form && selectedStepIndex >= 0
    ? getAvailableVariables(form.steps, selectedStepIndex)
    : [];

  // Check if form has changes
  const hasChanges = originalForm && form
    ? JSON.stringify(form) !== JSON.stringify(originalForm)
    : false;

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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {form.displayName || form.name}
              </h1>
              <button
                onClick={handleOpenRenameModal}
                className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                title="Rename form"
              >
                <HiPencil className="h-4 w-4" />
              </button>
            </div>
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
          {form.status === 'published' && (
            <Link href={`/chat/${form.publicUrl}`} target="_blank">
              <Button color="gray" size="sm" disabled={!form.publicUrl}>
                <HiEye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
          )}
          {form.status === 'published' && (
            <Link href={`/dashboard/forms/${formId}/submissions`}>
              <Button color="gray" size="sm">
                <HiClipboardList className="mr-2 h-4 w-4" />
                Submissions
              </Button>
            </Link>
          )}
          <Button
            color="gray"
            size="sm"
            onClick={handlePublish}
            disabled={form.steps.length === 0}
          >
            <HiGlobeAlt className="mr-2 h-4 w-4" />
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button color="gray" size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
            <HiSave className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          <pre className="whitespace-pre-wrap font-sans text-sm">{error}</pre>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-200">
          {successMessage}
        </div>
      )}

      {/* Main Builder Layout */}
      <div className="flex flex-1 gap-4">
        {/* Left: Step List */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
            isLeftSidebarCollapsed ? 'w-12' : 'w-80'
          }`}
        >
          <Card className="h-full relative">
            {isLeftSidebarCollapsed ? (
              <div className="flex h-full items-center justify-center">
                <button
                  onClick={() => setIsLeftSidebarCollapsed(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  title="Expand sidebar"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Steps</h3>
                  <div className="flex gap-1">
                    <div className="relative">
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => setShowAddStepMenu(!showAddStepMenu)}
                      >
                        <HiPlus className="h-4 w-4" />
                      </Button>

                      {showAddStepMenu && (
                        <>
                          {/* Backdrop to close menu when clicking outside */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowAddStepMenu(false)}
                          />
                          {/* Popover to the right */}
                          <div className="absolute left-full top-0 ml-2 z-20 w-64 rounded-lg border bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                            <div className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                              Choose step type
                            </div>
                            <div className="py-1">
                              {Object.values(StepType).map((type) => (
                                <button
                                  key={type}
                                  onClick={() => {
                                    handleAddStep(type);
                                    setShowAddStepMenu(false);
                                  }}
                                  className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <span className="mr-3 text-lg">{getStepIcon(type)}</span>
                                  <span>{getStepTypeLabel(type)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setIsLeftSidebarCollapsed(true)}
                      className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                      title="Collapse sidebar"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-visible">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={form.steps.map((step) => step.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <StepList
                        steps={form.steps}
                        selectedStepId={selectedStepId}
                        onSelectStep={setSelectedStepId}
                        onReorder={handleReorderSteps}
                        onDelete={handleDeleteStep}
                      />
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Center: Step Editor */}
        <div className="flex-1">
          <Card className="h-full overflow-y-auto">
            {selectedStep ? (
              <StepEditor
                key={selectedStep.id}
                step={selectedStep}
                onUpdate={handleUpdateStep}
                availableVariables={availableVariables}
                allSteps={form.steps}
              />
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
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
            isRightSidebarCollapsed ? 'w-12' : 'w-[480px]'
          }`}
        >
          <Card className="h-full flex flex-col relative">
            {isRightSidebarCollapsed ? (
              <div className="flex h-full items-center justify-center">
                <button
                  onClick={() => setIsRightSidebarCollapsed(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  title="Expand sidebar"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
                  <button
                    onClick={() => setIsRightSidebarCollapsed(true)}
                    className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                    title="Collapse sidebar"
                  >
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Tab Buttons */}
                <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSettingsTab('form')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      settingsTab === 'form'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Form Settings
                  </button>
                  <button
                    onClick={() => setSettingsTab('widget')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      settingsTab === 'widget'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Widget Settings
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Form Settings Tab */}
                  {settingsTab === 'form' && (
                    <>
                      {/* Display Name Section */}
                      <div className="mb-6 space-y-4">
                        <div>
                          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                            Display Information
                          </h3>
                          <div>
                            <div className="mb-2 block">
                              <Label htmlFor="displayName">Display Name (Optional)</Label>
                            </div>
                            <TextInput
                              id="displayName"
                              type="text"
                              placeholder={form.name}
                              value={form.displayName || ''}
                              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              If set, this name will be shown to users instead of &quot;{form.name}&quot;
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6 dark:border-gray-700">
                        <FormSettings
                          settings={form.settings}
                          formActions={form.formActions}
                          onUpdate={(settings) => setForm({ ...form, settings })}
                          onActionsUpdate={(formActions) => setForm({ ...form, formActions })}
                        />
                      </div>

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
                    </>
                  )}

                  {/* Widget Settings Tab */}
                  {settingsTab === 'widget' && (
                    <>
                      <WidgetSettings
                        settings={form.settings.widgetSettings || {}}
                        brandColor={form.settings.brandColor}
                        onUpdate={(widgetSettings) =>
                          setForm({
                            ...form,
                            settings: {
                              ...form.settings,
                              widgetSettings: {
                                ...form.settings.widgetSettings,
                                ...widgetSettings,
                              },
                            },
                          })
                        }
                      />

                      {/* Embed Code Section */}
                      <div className="mt-6 border-t pt-6 dark:border-gray-700">
                        <EmbedCodeDisplay publicUrl={form.publicUrl} />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal show={showRenameModal} onClose={() => setShowRenameModal(false)} size="md">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            Rename Form
          </h3>

          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Warning:</strong> Changing the form name will change the public URL and break any existing links that have been shared.
              </p>
              {form?.status === 'published' && (
                <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-200">
                  This form is currently <strong>published</strong>. Any shared links will stop working after renaming.
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="formName">New Form Name</Label>
              </div>
              <TextInput
                id="formName"
                type="text"
                placeholder="Enter new form name"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                required
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFormName.trim()) {
                    handleRename();
                  }
                }}
              />
            </div>

            {form?.publicUrl && (
              <div className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-300">Current URL:</p>
                <code className="mt-1 block rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                  /chat/{form.publicUrl}
                </code>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button color="gray" onClick={() => setShowRenameModal(false)}>
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleRename}
              disabled={isRenaming || !newFormName.trim()}
            >
              {isRenaming ? 'Renaming...' : 'Rename Form'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
