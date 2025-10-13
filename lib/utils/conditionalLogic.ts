import {
  Condition,
  ConditionalOperator,
  LogicalOperator,
  Step,
} from '@/types';

/**
 * Conditional Logic Evaluator
 * Determines which steps to show based on collected data
 */

/**
 * Evaluate a single condition
 * @param condition - The condition to evaluate
 * @param data - Collected data
 * @returns true if condition is met
 */
export function evaluateCondition(
  condition: Condition,
  data: Record<string, unknown>
): boolean {
  const value = data[condition.variableName];
  const targetValue = condition.value;

  // If variable doesn't exist, condition is false
  if (value === undefined || value === null) {
    return false;
  }

  switch (condition.operator) {
    case ConditionalOperator.EQUALS:
      return value === targetValue;

    case ConditionalOperator.NOT_EQUALS:
      return value !== targetValue;

    case ConditionalOperator.CONTAINS:
      return String(value)
        .toLowerCase()
        .includes(String(targetValue).toLowerCase());

    case ConditionalOperator.NOT_CONTAINS:
      return !String(value)
        .toLowerCase()
        .includes(String(targetValue).toLowerCase());

    case ConditionalOperator.GREATER_THAN:
      return Number(value) > Number(targetValue);

    case ConditionalOperator.LESS_THAN:
      return Number(value) < Number(targetValue);

    case ConditionalOperator.GREATER_THAN_OR_EQUAL:
      return Number(value) >= Number(targetValue);

    case ConditionalOperator.LESS_THAN_OR_EQUAL:
      return Number(value) <= Number(targetValue);

    case ConditionalOperator.IN:
      if (Array.isArray(targetValue)) {
        return targetValue.includes(value);
      }
      return false;

    case ConditionalOperator.NOT_IN:
      if (Array.isArray(targetValue)) {
        return !targetValue.includes(value);
      }
      return true;

    default:
      return false;
  }
}

/**
 * Evaluate multiple conditions with logical operator
 * @param conditions - Array of conditions
 * @param operator - AND or OR
 * @param data - Collected data
 * @returns true if conditions are met
 */
export function evaluateConditions(
  conditions: Condition[],
  operator: LogicalOperator,
  data: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  if (operator === LogicalOperator.AND) {
    return conditions.every((c) => evaluateCondition(c, data));
  } else {
    // OR
    return conditions.some((c) => evaluateCondition(c, data));
  }
}

/**
 * Check if a step should be shown based on its conditional logic
 * @param step - The step to evaluate
 * @param data - Collected data
 * @returns true if step should be shown
 */
export function shouldShowStep(step: Step, data: Record<string, unknown>): boolean {
  // If no conditional logic, always show the step
  if (!step.conditionalLogic) {
    return true;
  }

  const { showIf, operator } = step.conditionalLogic;

  return evaluateConditions(showIf, operator, data);
}

/**
 * Get the next step to show
 * @param currentStep - Current step
 * @param allSteps - All form steps
 * @param data - Collected data
 * @returns Next step or null if form is complete
 */
export function getNextStep(
  currentStep: Step,
  allSteps: Step[],
  data: Record<string, unknown>
): Step | null {
  const currentIndex = allSteps.findIndex((s) => s.id === currentStep.id);

  // Check for next step override (jump to specific step)
  if (currentStep.nextStepOverride?.rules) {
    for (const rule of currentStep.nextStepOverride.rules) {
      if (evaluateConditions(rule.conditions, rule.operator, data)) {
        const targetStep = allSteps.find((s) => s.id === rule.targetStepId);
        if (targetStep) {
          return targetStep;
        }
      }
    }

    // If no rules matched, check for default override
    if (currentStep.nextStepOverride.default) {
      const defaultStep = allSteps.find(
        (s) => s.id === currentStep.nextStepOverride!.default
      );
      if (defaultStep) {
        return defaultStep;
      }
    }
  }

  // Otherwise, find next visible step sequentially
  for (let i = currentIndex + 1; i < allSteps.length; i++) {
    if (shouldShowStep(allSteps[i], data)) {
      return allSteps[i];
    }
  }

  // No more steps
  return null;
}

/**
 * Get all visible steps for current data
 * @param allSteps - All form steps
 * @param data - Collected data
 * @returns Array of visible steps
 */
export function getVisibleSteps(
  allSteps: Step[],
  data: Record<string, unknown>
): Step[] {
  return allSteps.filter((step) => shouldShowStep(step, data));
}

/**
 * Calculate progress percentage
 * @param currentStepIndex - Current step index
 * @param visibleSteps - Array of visible steps
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  currentStepIndex: number,
  visibleSteps: Step[]
): number {
  if (visibleSteps.length === 0) return 0;
  return Math.round(((currentStepIndex + 1) / visibleSteps.length) * 100);
}

/**
 * Get the previous step (for back navigation)
 * @param currentStep - Current step
 * @param allSteps - All form steps
 * @param data - Collected data
 * @returns Previous step or null
 */
export function getPreviousStep(
  currentStep: Step,
  allSteps: Step[],
  data: Record<string, unknown>
): Step | null {
  const currentIndex = allSteps.findIndex((s) => s.id === currentStep.id);

  // Go backwards until we find a visible step
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (shouldShowStep(allSteps[i], data)) {
      return allSteps[i];
    }
  }

  // No previous steps
  return null;
}
