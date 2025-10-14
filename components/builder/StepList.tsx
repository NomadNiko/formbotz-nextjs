'use client';

import { useState } from 'react';
import { Button } from 'flowbite-react';
import { HiPlus, HiTrash, HiChevronUp, HiChevronDown } from 'react-icons/hi';
import { Step, StepType } from '@/types';
import { createStepTemplate, getStepTypeLabel } from '@/lib/utils/stepHelpers';

interface StepListProps {
  steps: Step[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onReorder: (steps: Step[]) => void;
  onDelete: (stepId: string) => void;
  onAdd: (step: Step) => void;
}

export default function StepList({
  steps,
  selectedStepId,
  onSelectStep,
  onDelete,
  onAdd,
  onReorder,
}: StepListProps) {
  const [showStepTypeMenu, setShowStepTypeMenu] = useState(false);

  const handleAddStep = (type: StepType) => {
    const newStep = createStepTemplate(type, steps.length);
    onAdd(newStep);
    onSelectStep(newStep.id); // Auto-select the newly created step
    setShowStepTypeMenu(false);
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    // Update order numbers
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i }));
    onReorder(reorderedSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    // Update order numbers
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i }));
    onReorder(reorderedSteps);
  };

  const getStepIcon = (type: StepType) => {
    switch (type) {
      case StepType.INFO:
        return '💬';
      case StepType.MULTIPLE_CHOICE:
        return '🎯';
      case StepType.YES_NO:
        return '✅';
      case StepType.STRING_INPUT:
        return '✏️';
      case StepType.VALIDATION:
        return '🔍';
      case StepType.CLOSING:
        return '👋';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`group cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md ${
            selectedStepId === step.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          }`}
          onClick={() => onSelectStep(step.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <span className="text-2xl">{getStepIcon(step.type)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    Step {index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    {getStepTypeLabel(step.type)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                  {step.display.messages[0]?.text || 'Empty message'}
                </p>
                {step.collect?.variableName && (
                  <span className="mt-1 inline-block rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {step.collect.variableName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveStepUp(index);
                }}
                disabled={index === 0}
                className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <HiChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveStepDown(index);
                }}
                disabled={index === steps.length - 1}
                className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <HiChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this step?')) {
                    onDelete(step.id);
                  }
                }}
                className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete"
              >
                <HiTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add Step Button */}
      <div className="relative">
        <Button
          color="light"
          className="w-full"
          onClick={() => setShowStepTypeMenu(!showStepTypeMenu)}
        >
          <HiPlus className="mr-2 h-4 w-4" />
          Add Step
        </Button>

        {showStepTypeMenu && (
          <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
              Choose step type
            </div>
            {Object.values(StepType).map((type) => (
              <button
                key={type}
                onClick={() => handleAddStep(type)}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="mr-2">{getStepIcon(type)}</span>
                {getStepTypeLabel(type)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
