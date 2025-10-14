import { DataType } from '@/types';
import { validatePhoneForCountry, getCountryByCode } from '@/lib/data/countryCodes';

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
 * Validate phone number with optional country code
 */
export function validatePhone(phone: string, countryCode?: string): { valid: boolean; error?: string } {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;

  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: "That doesn't look like a valid phone number. Please try again." };
  }

  const trimmedPhone = phone.trim();

  if (!phoneRegex.test(trimmedPhone)) {
    return { valid: false, error: "That doesn't look like a valid phone number. Please try again." };
  }

  // If country code is provided, validate based on country-specific rules
  if (countryCode) {
    const country = getCountryByCode(countryCode);
    if (!country) {
      return { valid: false, error: "Invalid country code selected." };
    }

    const isValid = validatePhoneForCountry(trimmedPhone, countryCode);
    if (!isValid) {
      const digits = trimmedPhone.replace(/\D/g, '').length;
      return {
        valid: false,
        error: `Phone number for ${country.country} should be ${country.minDigits}${country.minDigits !== country.maxDigits ? `-${country.maxDigits}` : ''} digits. You entered ${digits} digits.`
      };
    }
  } else {
    // Generic validation - at least 5 digits
    const digits = trimmedPhone.replace(/\D/g, '');
    if (digits.length < 5) {
      return { valid: false, error: "Phone number is too short. Please enter a valid phone number." };
    }
    if (digits.length > 15) {
      return { valid: false, error: "Phone number is too long. Please enter a valid phone number." };
    }
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
 * Validate country code
 */
export function validateCountryCode(code: string): { valid: boolean; error?: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: "Please select a country." };
  }

  const trimmedCode = code.trim();

  // Country codes start with + and have 1-4 digits
  const countryCodeRegex = /^\+\d{1,4}$/;

  if (!countryCodeRegex.test(trimmedCode)) {
    return { valid: false, error: "Invalid country code format." };
  }

  // Verify it exists in our country codes list
  const country = getCountryByCode(trimmedCode);
  if (!country) {
    return { valid: false, error: "Country code not recognized." };
  }

  return { valid: true };
}

/**
 * Main validation function that routes to specific validators
 */
export function validateInput(
  value: unknown,
  dataType: DataType,
  countryCode?: string
): { valid: boolean; error?: string } {
  switch (dataType) {
    case DataType.EMAIL:
      return validateEmail(String(value));

    case DataType.PHONE:
      return validatePhone(String(value), countryCode);

    case DataType.COUNTRY_CODE:
      return validateCountryCode(String(value));

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
