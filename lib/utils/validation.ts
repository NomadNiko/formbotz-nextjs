import { DataType } from '@/types';

/**
 * Validation utilities for form inputs
 */

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || typeof email !== 'string') {
    return { valid: false, error: "That doesn't look like a valid email. Please try again." };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { valid: false, error: "That doesn't look like a valid email. Please try again." };
  }

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: "That doesn't look like a valid email. Please try again." };
  }

  return { valid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;

  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: "That doesn't look like a valid phone number. Please try again." };
  }

  const trimmedPhone = phone.trim();

  if (trimmedPhone.length < 10) {
    return { valid: false, error: "That doesn't look like a valid phone number. Please try again." };
  }

  if (!phoneRegex.test(trimmedPhone)) {
    return { valid: false, error: "That doesn't look like a valid phone number. Please try again." };
  }

  return { valid: true };
}

/**
 * Validate number
 */
export function validateNumber(value: unknown): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: "Please enter a valid number." };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: "Please enter a valid number." };
  }

  return { valid: true };
}

/**
 * Main validation function that routes to specific validators
 */
export function validateInput(
  value: unknown,
  dataType: DataType
): { valid: boolean; error?: string } {
  switch (dataType) {
    case DataType.EMAIL:
      return validateEmail(String(value));

    case DataType.PHONE:
      return validatePhone(String(value));

    case DataType.NUMBER:
      return validateNumber(value);

    case DataType.FREETEXT:
    case DataType.NAME:
    case DataType.ADDRESS:
    case DataType.DATE_OF_BIRTH:
    case DataType.CUSTOM_ENUM:
    case DataType.CUSTOM_DATE:
      // No validation for these types yet
      return { valid: true };

    default:
      return { valid: true };
  }
}
