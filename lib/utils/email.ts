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
  emailData: SubmissionEmailData,
  retryAttempt = 0
) {
  const maxRetries = 3;

  try {
    // Format the submission data as HTML table - add Submitted date as first row
    const submittedRow = `
        <tr>
          <td style="padding: 8px; border: 1px solid #333333; background-color: #f3f4f6; font-family: 'Poppins', Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1f2937;">
            Submitted
          </td>
          <td style="padding: 8px; border: 1px solid #333333; font-family: 'Poppins', Arial, sans-serif; font-size: 13px; color: #333333;">
            ${escapeHtml(emailData.submittedAt)}
          </td>
        </tr>
      `;

    const dataRows = submittedRow + Object.entries(emailData.data)
      .map(
        ([key, value]) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #333333; background-color: #f3f4f6; font-family: 'Poppins', Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1f2937;">
            ${escapeHtml(key)}
          </td>
          <td style="padding: 8px; border: 1px solid #333333; font-family: 'Poppins', Arial, sans-serif; font-size: 13px; color: #333333;">
            ${formatValue(value)}
          </td>
        </tr>
      `
      )
      .join('');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://formbotz.nomadsoft.us';
    const logoUrl = `${appUrl}/FormBotz.png`;

    const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Form Submission</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style type="text/css">
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; display: block; }
    p { margin: 0; }
    @media only screen and (max-width: 600px) {
      .content-table { width: 100% !important; }
      .logo-img { width: 200px !important; height: auto !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #E2EAFC; font-family: 'Poppins', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #E2EAFC;">
    <tr>
      <td align="center" style="padding: 20px 0;">

        <!-- Main Container -->
        <table class="content-table" width="600" cellpadding="0" cellspacing="0" style="background-color: #EDF2FB;">

          <!-- Logo Section -->
          <tr>
            <td align="center" class="mobile-padding" style="padding: 30px 20px 10px 20px;">
              <img src="${logoUrl}" alt="FormBotz" class="logo-img" width="295" height="69" style="border-radius: 20px;">
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td class="mobile-padding" style="padding: 10px 20px 20px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px;">

                <!-- Title -->
                <tr>
                  <td align="center" style="padding: 30px 20px 10px 20px;">
                    <h1 style="margin: 0; font-family: 'Poppins', Arial, sans-serif; font-size: 24px; font-weight: 600; line-height: 1.3; color: #333333;">
                      New Form Submission Received
                    </h1>
                  </td>
                </tr>

                <!-- Form Name and Data -->
                <tr>
                  <td class="mobile-padding" style="padding: 20px;">
                    <p style="margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">
                      You've received a new submission for: <strong>${escapeHtml(emailData.formName)}</strong>
                    </p>

                    <!-- Data Table -->
                    <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #cccccc;">
                      <tbody>
                        ${dataRows}
                      </tbody>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer Message -->
          <tr>
            <td align="center" style="padding: 20px;">
              <p style="margin: 0; font-family: 'Poppins', Arial, sans-serif; font-size: 14px; line-height: 1.8; color: #333333;">
                Keep On Form Building!<br>
                <strong>The FormBotz Team</strong>
              </p>
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td class="mobile-padding" style="padding: 10px 20px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px;">

                <tr>
                  <td align="center" style="padding: 30px 20px;">
                    <h2 style="margin: 0; font-family: 'Poppins', Arial, sans-serif; font-size: 28px; font-weight: 600; line-height: 1.3; color: #333333;">
                      Have any questions?
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td class="mobile-padding" style="padding: 0 30px 20px 30px;">
                    <p style="margin: 0; font-family: 'Poppins', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">
                      We're just getting started, so feel free to ask questions, contribute, request features or just let us know how you're enjoying FormBotz.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding: 10px 30px;">
                    <p style="margin: 0; font-family: 'Poppins', Arial, sans-serif; font-size: 16px; font-weight: 600;">
                      <a href="tel:+18336594668" style="color: #30225E; text-decoration: none;">
                        📞 (+1) 833-659-4668
                      </a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding: 10px 30px 30px 30px;">
                    <p style="margin: 0; font-family: 'Poppins', Arial, sans-serif; font-size: 16px; font-weight: 600;">
                      <a href="mailto:formbotz@nomadsoft.us?subject=FormBotz%20Feedback" style="color: #30225E; text-decoration: none;">
                        ✉️ formbotz@nomadsoft.us
                      </a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
New Form Submission

You've received a new submission for: ${emailData.formName}

Submission Data:
Submitted: ${emailData.submittedAt}
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
      // Check if it's a rate limit error (429)
      const isRateLimitError =
        (error as { statusCode?: number; name?: string }).statusCode === 429 ||
        (error as { statusCode?: number; name?: string }).name === 'rate_limit_exceeded';

      if (isRateLimitError && retryAttempt < maxRetries) {
        const nextAttempt = retryAttempt + 1;
        console.log(
          `[Email Retry] Rate limit hit for ${toEmail}. Waiting 3 seconds before retry ${nextAttempt}/${maxRetries}...`
        );

        // Wait 3 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`[Email Retry] Retrying email to ${toEmail} (attempt ${nextAttempt}/${maxRetries})`);
        return sendSubmissionNotification(toEmail, emailData, nextAttempt);
      }

      console.error('Failed to send email:', error);
      return { success: false, error };
    }

    if (retryAttempt > 0) {
      console.log(`[Email Retry] Successfully sent email to ${toEmail} on retry attempt ${retryAttempt}`);
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
