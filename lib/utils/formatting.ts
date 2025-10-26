import { DataType } from '@/types';

/**
 * Text formatting utilities
 */

/**
 * Convert text to title case
 * Handles names properly: "niko" -> "Niko", "BENJAMIN AL JIR" -> "Benjamin Al Jir"
 * @param text - Text to convert
 * @returns Title cased text
 */
export function toTitleCase(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Format text for project name (lowercase, letters, numbers, hyphens only)
 * @param text - Text to format
 * @param isRealtime - If true, keeps leading/trailing hyphens for typing; if false, removes them
 * @returns Formatted project name
 */
export function formatProjectName(text: string, isRealtime = false): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let formatted = text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, '') // Remove any character that's not lowercase letter, number, or hyphen
    .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with single hyphen

  // Only remove leading/trailing hyphens for final submission, not during real-time typing
  if (!isRealtime) {
    formatted = formatted.replace(/^-+|-+$/g, '');
  }

  return formatted;
}

/**
 * Format value based on data type
 * @param value - Value to format
 * @param dataType - Data type from step configuration
 * @returns Formatted value
 */
export function formatByDataType(value: unknown, dataType?: DataType): unknown {
  if (!dataType || value === null || value === undefined) {
    return value;
  }

  // Only format string values
  if (typeof value !== 'string') {
    return value;
  }

  // Apply formatting based on data type
  switch (dataType) {
    case DataType.NAME:
      return toTitleCase(value);

    case DataType.PROJECT_NAME:
      return formatProjectName(value);

    default:
      return value;
  }
}
