import {
  FormAction,
  FormActionType,
  EmailActionConfig,
  ApiActionConfig,
} from '@/types';
import { sendSubmissionNotification } from './email';

export interface SubmissionData {
  formName: string;
  submissionId: string;
  data: Record<string, unknown>;
  submittedAt: string;
}

/**
 * Execute all form actions asynchronously
 * Errors are logged but don't throw (fire and forget)
 */
export async function executeFormActions(
  formActions: FormAction[],
  submissionData: SubmissionData
): Promise<void> {
  if (!formActions || formActions.length === 0) {
    console.log('[FormActions] No form actions to execute');
    return;
  }

  console.log(`[FormActions] Executing ${formActions.length} form actions for form: ${submissionData.formName}`);
  console.log(`[FormActions] Submission ID: ${submissionData.submissionId}`);
  console.log(`[FormActions] Actions to execute:`, formActions.map(a => ({ id: a._id, name: a.name, type: a.type })));

  // Wait 1 second before starting to avoid conflicts with opt-in email
  console.log('[FormActions] Waiting 1 second before starting form actions to avoid email rate limit conflicts...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Execute all actions in parallel (fire and forget)
  const promises = formActions.map(async (action) => {
    try {
      console.log(`[FormActions] Starting action "${action.name}" (${action.type})`, {
        actionId: action._id,
        hasConfig: !!action.config,
        configKeys: action.config ? Object.keys(action.config) : []
      });

      if (action.type === FormActionType.EMAIL) {
        await executeEmailAction(action, submissionData);
      } else if (action.type === FormActionType.API) {
        await executeApiAction(action, submissionData);
      } else {
        console.warn(`[FormActions] Unknown action type: ${action.type}`);
      }

      console.log(`[FormActions] Successfully completed action "${action.name}" (${action.type})`);
    } catch (error) {
      console.error(`[FormActions] Failed to execute action "${action.name}" (${action.type}):`, error);
    }
  });

  // Wait for all actions but don't throw if any fail
  const results = await Promise.allSettled(promises);
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`[FormActions] Execution complete: ${succeeded} succeeded, ${failed} failed`);
}

/**
 * Execute email action by sending to all recipients
 */
async function executeEmailAction(
  action: FormAction,
  submissionData: SubmissionData
): Promise<void> {
  const config = action.config as EmailActionConfig;

  console.log(`[EmailAction] Validating email action "${action.name}"`, {
    hasConfig: !!config,
    configType: typeof config,
    config: config
  });

  if (!config || typeof config !== 'object') {
    throw new Error(`Invalid config object for email action "${action.name}"`);
  }

  if (!config.recipients) {
    throw new Error(`No recipients field in config for email action "${action.name}"`);
  }

  if (!Array.isArray(config.recipients)) {
    throw new Error(`Recipients is not an array for email action "${action.name}". Got: ${typeof config.recipients}`);
  }

  if (config.recipients.length === 0) {
    throw new Error(`No recipients configured for email action "${action.name}"`);
  }

  console.log(`[EmailAction] Executing email action "${action.name}" to ${config.recipients.length} recipient(s):`, config.recipients);

  // Send to each recipient sequentially with delay to respect Resend's 2 req/sec rate limit
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < config.recipients.length; i++) {
    const recipient = config.recipients[i];

    try {
      console.log(`[EmailAction] Sending email ${i + 1}/${config.recipients.length} to ${recipient} for submission ${submissionData.submissionId}`);
      const result = await sendSubmissionNotification(recipient, submissionData);

      if (!result.success) {
        console.error(`[EmailAction] Failed to send email to ${recipient}:`, result.error);
        failCount++;
      } else {
        console.log(`[EmailAction] Email sent successfully to ${recipient}`, result.data);
        successCount++;
      }
    } catch (error) {
      console.error(`[EmailAction] Error sending email to ${recipient}:`, error);
      failCount++;
    }

    // Add 2 second delay between emails to respect Resend's 2 req/sec limit
    // This accounts for other servers and forms using the same API key
    // Skip delay after the last email
    if (i < config.recipients.length - 1) {
      console.log(`[EmailAction] Waiting 2 seconds before sending next email...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`[EmailAction] Email action "${action.name}" complete: ${successCount}/${config.recipients.length} emails sent successfully, ${failCount} failed`);
}

/**
 * Execute API action by making HTTP request to target URL
 */
async function executeApiAction(
  action: FormAction,
  submissionData: SubmissionData
): Promise<void> {
  const config = action.config as ApiActionConfig;

  console.log(`[ApiAction] Validating API action "${action.name}"`, {
    hasConfig: !!config,
    configType: typeof config,
    config: config
  });

  if (!config || typeof config !== 'object') {
    throw new Error(`Invalid config object for API action "${action.name}"`);
  }

  if (!config.targetUrl) {
    throw new Error(`No target URL configured for API action "${action.name}"`);
  }

  console.log(`[ApiAction] Executing API action "${action.name}" to ${config.targetUrl}`, {
    method: config.method || 'POST',
    hasHeaders: !!config.headers
  });

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // Prepare request body
  const requestBody = {
    formName: submissionData.formName,
    submissionId: submissionData.submissionId,
    submittedAt: submissionData.submittedAt,
    data: submissionData.data,
  };

  try {
    // Make request with 30s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(config.targetUrl, {
      method: config.method || 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log response
    const responseText = await response.text();
    console.log(`[ApiAction] API action "${action.name}" response:`, {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 200), // Log first 200 chars
    });

    if (!response.ok) {
      console.error(`[ApiAction] API action "${action.name}" failed with status ${response.status}: ${responseText}`);
    } else {
      console.log(`[ApiAction] API action "${action.name}" completed successfully`);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`API request timed out after 30 seconds`);
      }
      throw new Error(`API request failed: ${error.message}`);
    }
    throw error;
  }
}
