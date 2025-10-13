'use client';

import { useState } from 'react';
import { Label, TextInput, Textarea, Select, Checkbox, Button } from 'flowbite-react';
import { HiPlus, HiTrash } from 'react-icons/hi';
import { Step, DataType, ChoiceOption } from '@/types';
import { getStepTypeLabel, getDataTypeLabel } from '@/lib/utils/stepHelpers';
import { v4 as uuidv4 } from 'uuid';

interface StepEditorProps {
  step: Step;
  onUpdate: (step: Step) => void;
}

export default function StepEditor({ step, onUpdate }: StepEditorProps) {
  const [localStep, setLocalStep] = useState<Step>(step);

  const handleUpdate = (updates: Partial<Step>) => {
    const updated = { ...localStep, ...updates };
    setLocalStep(updated);
    onUpdate(updated);
  };

  const handleMessageChange = (index: number, text: string) => {
    const newMessages = [...localStep.display.messages];
    newMessages[index] = { ...newMessages[index], text };
    handleUpdate({
      display: { ...localStep.display, messages: newMessages },
    });
  };

  const handleAddChoice = () => {
    if (!localStep.input) return;
    const newChoice: ChoiceOption = {
      id: uuidv4(),
      label: `Option ${(localStep.input.choices?.length || 0) + 1}`,
      value: `option${(localStep.input.choices?.length || 0) + 1}`,
    };
    handleUpdate({
      input: {
        ...localStep.input,
        choices: [...(localStep.input.choices || []), newChoice],
      },
    });
  };

  const handleUpdateChoice = (index: number, field: keyof ChoiceOption, value: string | number | boolean | unknown) => {
    if (!localStep.input?.choices) return;
    const newChoices = [...localStep.input.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    handleUpdate({
      input: { ...localStep.input, choices: newChoices },
    });
  };

  const handleDeleteChoice = (index: number) => {
    if (!localStep.input?.choices) return;
    const newChoices = localStep.input.choices.filter((_, i) => i !== index);
    handleUpdate({
      input: { ...localStep.input, choices: newChoices },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Edit Step
        </h2>
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStepTypeLabel(localStep.type)}
          </p>
        </div>
      </div>

      {/* Message */}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="message">Message</Label>
        </div>
        <Textarea
          id="message"
          placeholder="Enter your message..."
          rows={4}
          value={localStep.display.messages[0]?.text || ''}
          onChange={(e) => handleMessageChange(0, e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">
          Use {'{'}variableName{'}'} to insert collected data
        </p>
      </div>

      {/* Input Configuration for choice-based steps */}
      {localStep.input?.type === 'choice' && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Label>Options</Label>
            <Button size="xs" color="light" onClick={handleAddChoice}>
              <HiPlus className="mr-1 h-3 w-3" />
              Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {localStep.input.choices?.map((choice, index) => (
              <div key={choice.id} className="flex gap-2">
                <TextInput
                  placeholder="Label"
                  value={choice.label}
                  onChange={(e) =>
                    handleUpdateChoice(index, 'label', e.target.value)
                  }
                  className="flex-1"
                />
                <TextInput
                  placeholder="Value"
                  value={String(choice.value)}
                  onChange={(e) =>
                    handleUpdateChoice(index, 'value', e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => handleDeleteChoice(index)}
                >
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Type for text input */}
      {localStep.input?.type === 'text' && (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="dataType">Input Type</Label>
          </div>
          <Select
            id="dataType"
            value={localStep.input.dataType || DataType.FREETEXT}
            onChange={(e) =>
              handleUpdate({
                input: {
                  ...localStep.input!,
                  dataType: e.target.value as DataType,
                },
              })
            }
          >
            {Object.values(DataType).map((type) => (
              <option key={type} value={type}>
                {getDataTypeLabel(type)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Placeholder for text input */}
      {localStep.input?.type === 'text' && (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="placeholder">Placeholder</Label>
          </div>
          <TextInput
            id="placeholder"
            placeholder="Enter placeholder text..."
            value={localStep.input.placeholder || ''}
            onChange={(e) =>
              handleUpdate({
                input: { ...localStep.input!, placeholder: e.target.value },
              })
            }
          />
        </div>
      )}

      {/* Data Collection */}
      {localStep.input?.type !== 'none' && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
            Data Collection
          </h3>

          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="collectData"
              checked={localStep.collect?.enabled || false}
              onChange={(e) =>
                handleUpdate({
                  collect: localStep.collect
                    ? { ...localStep.collect, enabled: e.target.checked }
                    : { enabled: e.target.checked, variableName: '', storageKey: '' },
                })
              }
            />
            <Label htmlFor="collectData">Collect and store this data</Label>
          </div>

          {localStep.collect?.enabled && (
            <div className="space-y-3">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="variableName">Variable Name</Label>
                </div>
                <TextInput
                  id="variableName"
                  placeholder="e.g., userName, userEmail"
                  value={localStep.collect.variableName || ''}
                  onChange={(e) =>
                    handleUpdate({
                      collect: {
                        ...localStep.collect!,
                        variableName: e.target.value,
                        storageKey: e.target.value,
                      },
                    })
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use this name to reference the data: {'{'}
                  {localStep.collect.variableName || 'variableName'}
                  {'}'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conditional Logic Preview */}
      {localStep.conditionalLogic && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
            Conditional Logic
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This step has conditional logic applied
          </p>
        </div>
      )}
    </div>
  );
}
