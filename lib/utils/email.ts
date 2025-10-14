import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SubmissionEmailData {
  formName: string;
  submissionId: string;
  data: Record<string, unknown>;
  submittedAt: string;
}

export async function sendSubmissionNotification(
  toEmail: string,
  emailData: SubmissionEmailData
) {
  try {
    // Format the submission data as HTML table
    const dataRows = Object.entries(emailData.data)
      .map(
        ([key, value]) => `
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600;">
            ${escapeHtml(key)}
          </td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">
            ${formatValue(value)}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background-color: #3b82f6; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 700;">
      🎉 New Form Submission
    </h1>
  </div>

  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">

    <p style="font-size: 16px; margin-bottom: 20px;">
      You've received a new submission for <strong>${escapeHtml(emailData.formName)}</strong>
    </p>

    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
      <p style="margin: 5px 0; font-size: 14px;">
        <strong>Submission ID:</strong> ${escapeHtml(emailData.submissionId)}
      </p>
      <p style="margin: 5px 0; font-size: 14px;">
        <strong>Submitted:</strong> ${escapeHtml(emailData.submittedAt)}
      </p>
    </div>

    <h2 style="font-size: 18px; margin-bottom: 15px; color: #1f2937;">
      Submission Data
    </h2>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
      <tbody>
        ${dataRows}
      </tbody>
    </table>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        This is an automated notification from FormBotz
      </p>
    </div>

  </div>

</body>
</html>
    `;

    const textContent = `
New Form Submission

Form: ${emailData.formName}
Submission ID: ${emailData.submissionId}
Submitted: ${emailData.submittedAt}

Submission Data:
${Object.entries(emailData.data)
  .map(([key, value]) => `${key}: ${formatValueText(value)}`)
  .join('\n')}

---
This is an automated notification from FormBotz
    `.trim();

    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || 'FormBotz <noreply@formbotz.com>',
      to: toEmail,
      subject: `New submission for ${emailData.formName}`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '<em style="color: #9ca3af;">(empty)</em>';
  }
  if (typeof value === 'boolean') {
    return value ? '<strong>Yes</strong>' : '<strong>No</strong>';
  }
  if (Array.isArray(value)) {
    return escapeHtml(value.join(', '));
  }
  if (typeof value === 'object') {
    return escapeHtml(JSON.stringify(value, null, 2));
  }
  return escapeHtml(String(value));
}

function formatValueText(value: unknown): string {
  if (value === null || value === undefined) {
    return '(empty)';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
