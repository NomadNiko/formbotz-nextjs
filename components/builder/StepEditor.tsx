'use client';

import { useState } from 'react';
import { Label, TextInput, Textarea, Select, Checkbox, Button } from 'flowbite-react';
import { HiPlus, HiTrash } from 'react-icons/hi';
import { Step, DataType, ChoiceOption, Condition, ConditionalOperator, LogicalOperator } from '@/types';
import { getStepTypeLabel, getDataTypeLabel } from '@/lib/utils/stepHelpers';
import { v4 as uuidv4 } from 'uuid';
import { countryCodes } from '@/lib/data/countryCodes';

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

  const handleAddCondition = () => {
    const newCondition: Condition = {
      variableName: '',
      operator: ConditionalOperator.EQUALS,
      value: '',
    };
    const currentLogic = localStep.conditionalLogic || {
      showIf: [],
      operator: LogicalOperator.AND,
    };
    handleUpdate({
      conditionalLogic: {
        ...currentLogic,
        showIf: [...currentLogic.showIf, newCondition],
      },
    });
  };

  const handleUpdateCondition = (index: number, field: keyof Condition, value: string) => {
    if (!localStep.conditionalLogic) return;
    const newConditions = [...localStep.conditionalLogic.showIf];
    newConditions[index] = { ...newConditions[index], [field]: value };
    handleUpdate({
      conditionalLogic: {
        ...localStep.conditionalLogic,
        showIf: newConditions,
      },
    });
  };

  const handleDeleteCondition = (index: number) => {
    if (!localStep.conditionalLogic) return;
    const newConditions = localStep.conditionalLogic.showIf.filter((_, i) => i !== index);
    if (newConditions.length === 0) {
      handleUpdate({ conditionalLogic: undefined });
    } else {
      handleUpdate({
        conditionalLogic: {
          ...localStep.conditionalLogic,
          showIf: newConditions,
        },
      });
    }
  };

  const handleToggleConditionalLogic = (enabled: boolean) => {
    if (enabled) {
      handleUpdate({
        conditionalLogic: {
          showIf: [],
          operator: LogicalOperator.AND,
        },
      });
    } else {
      handleUpdate({ conditionalLogic: undefined });
    }
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

      {/* Country Code for phone input */}
      {localStep.input?.type === 'text' && localStep.input?.dataType === DataType.PHONE && (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="countryCode">Country Code</Label>
          </div>
          <Select
            id="countryCode"
            value={localStep.input.countryCode || ''}
            onChange={(e) =>
              handleUpdate({
                input: {
                  ...localStep.input!,
                  countryCode: e.target.value,
                },
              })
            }
          >
            <option value="">Select country (optional)</option>
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.country} ({country.code}) - {country.minDigits}
                {country.minDigits !== country.maxDigits ? `-${country.maxDigits}` : ''} digits
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            {"Selecting a country will validate phone numbers based on that country's format"}
          </p>
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

      {/* Conditional Logic Editor */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <Checkbox
            id="enableConditionalLogic"
            checked={!!localStep.conditionalLogic}
            onChange={(e) => handleToggleConditionalLogic(e.target.checked)}
          />
          <Label htmlFor="enableConditionalLogic">
            Enable Conditional Logic
          </Label>
        </div>
        <p className="mb-3 text-xs text-gray-500">
          Show this step only if certain conditions are met
        </p>

        {localStep.conditionalLogic && (
          <div className="space-y-3">
            <div>
              <Label>Logic Operator</Label>
              <Select
                value={localStep.conditionalLogic.operator}
                onChange={(e) =>
                  handleUpdate({
                    conditionalLogic: {
                      ...localStep.conditionalLogic!,
                      operator: e.target.value as LogicalOperator,
                    },
                  })
                }
              >
                <option value={LogicalOperator.AND}>AND (all conditions must be true)</option>
                <option value={LogicalOperator.OR}>OR (any condition can be true)</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Conditions</Label>
                <Button size="xs" color="light" onClick={handleAddCondition}>
                  <HiPlus className="mr-1 h-3 w-3" />
                  Add Condition
                </Button>
              </div>

              {localStep.conditionalLogic.showIf.map((condition, index) => (
                <div key={index} className="mb-2 rounded border border-gray-200 p-3 dark:border-gray-700">
                  <div className="mb-2 grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Variable Name</Label>
                      <TextInput
                        sizing="sm"
                        placeholder="e.g., rating"
                        value={condition.variableName}
                        onChange={(e) =>
                          handleUpdateCondition(index, 'variableName', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Operator</Label>
                      <Select
                        sizing="sm"
                        value={condition.operator}
                        onChange={(e) =>
                          handleUpdateCondition(index, 'operator', e.target.value)
                        }
                      >
                        <option value={ConditionalOperator.EQUALS}>Equals</option>
                        <option value={ConditionalOperator.NOT_EQUALS}>Not Equals</option>
                        <option value={ConditionalOperator.CONTAINS}>Contains</option>
                        <option value={ConditionalOperator.GREATER_THAN}>Greater Than</option>
                        <option value={ConditionalOperator.LESS_THAN}>Less Than</option>
                        <option value={ConditionalOperator.GREATER_THAN_OR_EQUAL}>
                          Greater Than or Equal
                        </option>
                        <option value={ConditionalOperator.LESS_THAN_OR_EQUAL}>
                          Less Than or Equal
                        </option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Value</Label>
                      <TextInput
                        sizing="sm"
                        placeholder="e.g., 3"
                        value={condition.value}
                        onChange={(e) =>
                          handleUpdateCondition(index, 'value', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => handleDeleteCondition(index)}
                  >
                    <HiTrash className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
