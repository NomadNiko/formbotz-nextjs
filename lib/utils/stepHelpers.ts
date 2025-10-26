import { v4 as uuidv4 } from 'uuid';
import {
  Step,
  StepType,
  OutputType,
  DataType,
} from '@/types';

/**
 * Create a new empty step
 */
export function createEmptyStep(order: number): Step {
  return {
    id: uuidv4(),
    order,
    type: StepType.STRING_INPUT,
    outputType: OutputType.STRING_QUESTION,
    display: {
      messages: [{ text: '' }],
    },
    input: {
      type: 'text',
      dataType: DataType.FREETEXT,
      validation: [],
    },
    collect: {
      enabled: true,
      variableName: '',
      storageKey: '',
    },
  };
}

/**
 * Create a step template based on type
 */
export function createStepTemplate(type: StepType, order: number): Step {
  const baseStep = createEmptyStep(order);

  switch (type) {
    case StepType.INFO:
      return {
        ...baseStep,
        type: StepType.INFO,
        outputType: OutputType.STRING_INFO,
        input: {
          type: 'none',
        },
        collect: undefined,
      };

    case StepType.MULTIPLE_CHOICE:
      return {
        ...baseStep,
        type: StepType.MULTIPLE_CHOICE,
        outputType: OutputType.BUTTON_LIST,
        input: {
          type: 'choice',
          choices: [
            { id: uuidv4(), label: 'Option 1', value: 'option1' },
            { id: uuidv4(), label: 'Option 2', value: 'option2' },
          ],
        },
      };

    case StepType.YES_NO:
      return {
        ...baseStep,
        type: StepType.YES_NO,
        outputType: OutputType.BUTTON_LIST,
        input: {
          type: 'choice',
          choices: [
            { id: uuidv4(), label: 'Yes', value: true },
            { id: uuidv4(), label: 'No', value: false },
          ],
        },
      };

    case StepType.REPLAY:
      return {
        ...baseStep,
        type: StepType.REPLAY,
        outputType: OutputType.STRING_QUESTION,
        display: {
          messages: [{ text: 'Replaying previous step...' }],
        },
        input: {
          type: 'none',
        },
        collect: undefined,
        replayTarget: undefined, // User will select the target step
      };

    case StepType.CLOSING:
      return {
        ...baseStep,
        type: StepType.CLOSING,
        outputType: OutputType.STRING_INFO,
        display: {
          messages: [{ text: 'Thank you for your submission!' }],
        },
        input: {
          type: 'none',
        },
        collect: undefined,
      };

    default:
      return baseStep;
  }
}

/**
 * Get step type display name
 */
export function getStepTypeLabel(type: StepType): string {
  const labels: Record<StepType, string> = {
    [StepType.INFO]: 'Information',
    [StepType.MULTIPLE_CHOICE]: 'Multiple Choice',
    [StepType.YES_NO]: 'Yes/No Question',
    [StepType.STRING_INPUT]: 'Text Input',
    [StepType.REPLAY]: 'Replay Step',
    [StepType.CLOSING]: 'Closing Message',
  };
  return labels[type];
}

/**
 * Get step type icon emoji
 */
export function getStepIcon(type: StepType): string {
  const icons: Record<StepType, string> = {
    [StepType.INFO]: '💬',
    [StepType.MULTIPLE_CHOICE]: '🎯',
    [StepType.YES_NO]: '✅',
    [StepType.STRING_INPUT]: '✏️',
    [StepType.REPLAY]: '🔄',
    [StepType.CLOSING]: '👋',
  };
  return icons[type];
}

/**
 * Get data type display name
 */
export function getDataTypeLabel(type: DataType): string {
  const labels: Record<DataType, string> = {
    [DataType.FREETEXT]: 'Free Text',
    [DataType.NAME]: 'Name',
    [DataType.DATE_OF_BIRTH]: 'Date of Birth',
    [DataType.PHONE]: 'Phone Number',
    [DataType.COUNTRY_CODE]: 'Country Code',
    [DataType.ADDRESS]: 'Address',
    [DataType.EMAIL]: 'Email',
    [DataType.NUMBER]: 'Number',
    [DataType.PROJECT_NAME]: 'Project Name',
    [DataType.CUSTOM_ENUM]: 'Custom Options',
    [DataType.CUSTOM_DATE]: 'Custom Date',
  };
  return labels[type];
}

/**
 * Validate step configuration
 */
export function validateStep(step: Step): string[] {
  const errors: string[] = [];

  if (!step.display.messages || step.display.messages.length === 0) {
    errors.push('Step must have at least one message');
  }

  if (
    step.display.messages.some(
      (m) => !m.text || m.text.trim().length === 0
    )
  ) {
    errors.push('Messages cannot be empty');
  }

  if (step.input?.type === 'choice') {
    if (!step.input.choices || step.input.choices.length === 0) {
      errors.push('Choice steps must have at least one option');
    }
  }

  if (step.collect?.enabled && !step.collect.variableName) {
    errors.push('Variable name is required when data collection is enabled');
  }

  if (step.type === StepType.REPLAY && !step.replayTarget) {
    errors.push('Replay step must have a target step');
  }

  return errors;
}

/**
 * Validate and fix replay targets in a form
 * Returns fixed steps and any errors found
 */
export function validateAndFixReplayTargets(steps: Step[]): {
  steps: Step[];
  errors: string[];
} {
  const errors: string[] = [];
  const stepIdToOrder = new Map<string, number>();

  // Build a map of step ID to order
  steps.forEach((step) => {
    stepIdToOrder.set(step.id, step.order);
  });

  const fixedSteps = steps.map((step) => {
    if (step.type !== StepType.REPLAY || !step.replayTarget) {
      return step;
    }

    const targetOrder = stepIdToOrder.get(step.replayTarget);

    // Check if target step exists
    if (targetOrder === undefined) {
      errors.push(`Step ${step.order + 1} (REPLAY) points to a non-existent step`);
      return { ...step, replayTarget: undefined };
    }

    // Check if target is before this step
    if (targetOrder >= step.order) {
      errors.push(`Step ${step.order + 1} (REPLAY) cannot replay a later step`);
      return { ...step, replayTarget: undefined };
    }

    return step;
  });

  return { steps: fixedSteps, errors };
}

/**
 * Reorder steps after drag and drop
 * Note: replay targets now use step IDs, so they remain stable across reordering
 */
export function reorderSteps(
  steps: Step[],
  startIndex: number,
  endIndex: number
): Step[] {
  const result = Array.from(steps);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  // Simply update order numbers - replay targets (by ID) remain valid
  return result.map((step, index) => ({
    ...step,
    order: index,
  }));
}
