/**
 * Variable Interpolation Engine
 * Replaces {variableName} placeholders with actual collected data
 */

/**
 * Interpolate variables in a text string
 * @param text - Text containing {variableName} placeholders
 * @param data - Object with collected data
 * @returns Text with variables replaced
 *
 * Note: Name values should already be title-cased when stored in the database,
 * so this function just displays them as-is.
 */
export function interpolateVariables(
  text: string,
  data: Record<string, unknown>
): string {
  if (!text) return '';

  return text.replace(/\{(\w+)\}/g, (match, variableName) => {
    const value = data[variableName];

    // If variable doesn't exist, return the placeholder
    if (value === undefined || value === null) {
      return match;
    }

    // Convert to string
    let stringValue = String(value);

    // Format country code values (e.g., "United States|+1" -> "United States +1")
    if (stringValue.includes('|+')) {
      stringValue = stringValue.replace('|', ' ');
    }

    return stringValue;
  });
}

/**
 * Extract all variable names from a text string
 * @param text - Text containing {variableName} placeholders
 * @returns Array of variable names found
 */
export function extractVariables(text: string): string[] {
  if (!text) return [];

  const matches = text.matchAll(/\{(\w+)\}/g);
  const variables = Array.from(matches, (m) => m[1]);

  // Return unique variable names
  return [...new Set(variables)];
}

/**
 * Check if text contains any variables
 * @param text - Text to check
 * @returns true if text contains {variableName} patterns
 */
export function hasVariables(text: string): boolean {
  if (!text) return false;
  return /\{(\w+)\}/.test(text);
}

/**
 * Validate that all variables in text exist in data
 * @param text - Text containing variables
 * @param data - Available data
 * @returns Array of missing variable names
 */
export function getMissingVariables(
  text: string,
  data: Record<string, unknown>
): string[] {
  const variables = extractVariables(text);
  return variables.filter((v) => data[v] === undefined || data[v] === null);
}

/**
 * Build a validation summary step content
 * @param data - Collected data
 * @param labels - Mapping of variable names to human-readable labels
 * @returns Formatted text showing all collected data
 */
export function buildValidationSummary(
  data: Record<string, unknown>,
  labels?: Record<string, string>
): string {
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return 'No data collected yet.';
  }

  const lines = entries.map(([key, value]) => {
    const label = labels?.[key] || key;
    let displayValue = String(value);

    // Format country code values (e.g., "United States|+1" -> "United States +1")
    if (displayValue.includes('|+')) {
      displayValue = displayValue.replace('|', ' ');
    }

    return `- ${label}: ${displayValue}`;
  });

  return `I got:\n\n${lines.join('\n')}\n\nIs this information correct?`;
}

/**
 * Interpolate variables in multiple messages
 * @param messages - Array of message objects
 * @param data - Collected data
 * @returns Messages with interpolated variables
 */
export function interpolateMessages(
  messages: { text: string; delay?: number }[],
  data: Record<string, unknown>
): { text: string; delay?: number }[] {
  return messages.map((msg) => ({
    ...msg,
    text: interpolateVariables(msg.text, data),
  }));
}
