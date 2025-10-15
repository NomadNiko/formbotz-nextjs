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

    default:
      return value;
  }
}
