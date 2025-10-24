import { Step } from '@/types';
import { extractVariables } from './interpolation';

/**
 * Get all variables that are collected before a given step index
 * @param steps - All form steps
 * @param currentStepIndex - Index of the current step
 * @returns Array of variable names available at this step
 */
export function getAvailableVariables(steps: Step[], currentStepIndex: number): string[] {
  const variables: string[] = [];

  // Only look at steps BEFORE the current step
  for (let i = 0; i < currentStepIndex; i++) {
    const step = steps[i];
    if (step.collect?.enabled && step.collect.variableName) {
      variables.push(step.collect.variableName);
    }
  }

  return variables;
}

/**
 * Validate that all conditional logic references valid variables
 * that are collected in previous steps
 * @param steps - All form steps
 * @returns Validation result with errors
 */
export function validateFormConditionalLogic(steps: Step[]): {
  isValid: boolean;
  errors: string[];
  invalidSteps: number[];
} {
  const errors: string[] = [];
  const invalidSteps: number[] = [];

  steps.forEach((step, index) => {
    const availableVariables = getAvailableVariables(steps, index);
    const stepNumber = index + 1;

    // Check conditionalLogic.showIf conditions
    if (step.conditionalLogic?.showIf) {
      step.conditionalLogic.showIf.forEach((condition, condIndex) => {
        if (condition.variableName && !availableVariables.includes(condition.variableName)) {
          errors.push(
            `Step ${stepNumber}: Condition ${condIndex + 1} references variable "${condition.variableName}" which hasn't been collected yet`
          );
          if (!invalidSteps.includes(index)) {
            invalidSteps.push(index);
          }
        }
      });
    }

    // Check nextStepOverride rules conditions
    if (step.nextStepOverride?.rules) {
      step.nextStepOverride.rules.forEach((rule, ruleIndex) => {
        rule.conditions.forEach((condition, condIndex) => {
          if (condition.variableName && !availableVariables.includes(condition.variableName)) {
            errors.push(
              `Step ${stepNumber}: Next step rule ${ruleIndex + 1}, condition ${condIndex + 1} references variable "${condition.variableName}" which hasn't been collected yet`
            );
            if (!invalidSteps.includes(index)) {
              invalidSteps.push(index);
            }
          }
        });
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    invalidSteps,
  };
}

/**
 * Get a human-readable list of all variables collected in a form
 * @param steps - All form steps
 * @returns Map of variable name to step info
 */
export function getAllFormVariables(steps: Step[]): Map<string, { stepIndex: number; stepName: string }> {
  const variableMap = new Map<string, { stepIndex: number; stepName: string }>();

  steps.forEach((step, index) => {
    if (step.collect?.enabled && step.collect.variableName) {
      variableMap.set(step.collect.variableName, {
        stepIndex: index,
        stepName: step.display.messages[0]?.text?.substring(0, 50) || `Step ${index + 1}`,
      });
    }
  });

  return variableMap;
}

/**
 * Validate that all variables referenced in step messages exist and are available
 * @param steps - All form steps
 * @returns Validation result with warnings (non-blocking)
 */
export function validateMessageVariables(steps: Step[]): {
  warnings: string[];
  invalidSteps: number[];
} {
  const warnings: string[] = [];
  const invalidSteps: number[] = [];
  const allCollectedVariables = new Set<string>();

  // Build a set of all variables that are ever collected in the form
  steps.forEach((step) => {
    if (step.collect?.enabled && step.collect.variableName) {
      allCollectedVariables.add(step.collect.variableName);
    }
  });

  // Check each step's messages
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const availableVariables = getAvailableVariables(steps, index);

    // Extract variables from all messages in this step
    const allVariablesInMessages = new Set<string>();
    step.display.messages.forEach((message) => {
      const variables = extractVariables(message.text);
      variables.forEach((v) => allVariablesInMessages.add(v));
    });

    // Check each variable used in messages
    allVariablesInMessages.forEach((variableName) => {
      // Check 1: Variable doesn't exist anywhere in the form
      if (!allCollectedVariables.has(variableName)) {
        warnings.push(
          `Step ${stepNumber}: Variable "{${variableName}}" in message text is never collected in this form`
        );
        if (!invalidSteps.includes(index)) {
          invalidSteps.push(index);
        }
      }
      // Check 2: Variable exists but isn't available at this point
      else if (!availableVariables.includes(variableName)) {
        warnings.push(
          `Step ${stepNumber}: Variable "{${variableName}}" in message text hasn't been collected yet (will show as {${variableName}} to users)`
        );
        if (!invalidSteps.includes(index)) {
          invalidSteps.push(index);
        }
      }
    });
  });

  return {
    warnings,
    invalidSteps,
  };
}
