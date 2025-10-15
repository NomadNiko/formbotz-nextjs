import { Step } from '@/types';

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
