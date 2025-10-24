'use client';

import { HiTrash, HiChevronUp, HiChevronDown, HiDuplicate } from 'react-icons/hi';
import { Step, StepType } from '@/types';
import { getStepTypeLabel, getStepIcon, reorderSteps } from '@/lib/utils/stepHelpers';
import { v4 as uuidv4 } from 'uuid';

interface StepListProps {
  steps: Step[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onReorder: (steps: Step[]) => void;
  onDelete: (stepId: string) => void;
}

export default function StepList({
  steps,
  selectedStepId,
  onSelectStep,
  onDelete,
  onReorder,
}: StepListProps) {

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const reorderedSteps = reorderSteps(steps, index, index - 1);
    onReorder(reorderedSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const reorderedSteps = reorderSteps(steps, index, index + 1);
    onReorder(reorderedSteps);
  };

  const cloneStep = (index: number) => {
    const stepToClone = steps[index];

    // Deep clone the step with a new ID
    const clonedStep: Step = {
      ...stepToClone,
      id: uuidv4(),
      order: index + 1,
      // Clone input choices if they exist
      input: stepToClone.input
        ? {
            ...stepToClone.input,
            choices: stepToClone.input.choices?.map((choice) => ({
              ...choice,
              id: uuidv4(),
            })),
          }
        : undefined,
      // Clone conditional logic conditions
      conditionalLogic: stepToClone.conditionalLogic
        ? {
            ...stepToClone.conditionalLogic,
            showIf: stepToClone.conditionalLogic.showIf.map((condition) => ({
              ...condition,
            })),
          }
        : undefined,
      // Clone next step override rules
      nextStepOverride: stepToClone.nextStepOverride
        ? {
            ...stepToClone.nextStepOverride,
            rules: stepToClone.nextStepOverride.rules.map((rule) => ({
              ...rule,
              conditions: rule.conditions.map((condition) => ({
                ...condition,
              })),
            })),
          }
        : undefined,
    };

    // Insert the cloned step right after the original
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, clonedStep);

    // Update order numbers (replay targets by ID remain valid)
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i }));
    onReorder(reorderedSteps);

    // Select the newly cloned step
    onSelectStep(clonedStep.id);
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
          {/* Action buttons row at top */}
          <div className="mb-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
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
                cloneStep(index);
              }}
              className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
              title="Clone step"
            >
              <HiDuplicate className="h-4 w-4" />
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

          {/* Content below */}
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
              <div className="mt-1 flex flex-wrap gap-1">
                {step.collect?.variableName && (
                  <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {step.collect.variableName}
                  </span>
                )}
                {step.type === StepType.REPLAY && step.replayTarget !== undefined && (() => {
                  const targetStep = steps.find(s => s.id === step.replayTarget);
                  return targetStep ? (
                    <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      🔄 Replay: Step {targetStep.order + 1}
                    </span>
                  ) : (
                    <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-300">
                      🔄 Replay: Invalid target
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
