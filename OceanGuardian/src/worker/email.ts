/**
 * Resend email helper for Cloudflare Workers
 *
 * Uses the Resend REST API directly via fetch (no npm dependency)
 * to avoid Node.js polyfill issues in the workerd runtime.
 *
 * API Reference: https://resend.com/docs/api-reference/emails/send-email
 */

interface SendEmailParams {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
}

interface ResendResponse {
    id?: string;
    statusCode?: number;
    message?: string;
    name?: string;
}

/**
 * Send an email via the Resend REST API.
 */
export async function sendEmail(
    apiKey: string,
    params: SendEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: params.from,
                to: Array.isArray(params.to) ? params.to : [params.to],
                subject: params.subject,
                html: params.html,
            }),
        });

        const data = (await response.json()) as ResendResponse;

        if (!response.ok) {
            console.error("Resend API error:", data);
            return {
                success: false,
                error: data.message || `Resend API error (${response.status})`,
            };
        }

        return { success: true, id: data.id };
    } catch (error) {
        console.error("Failed to send email via Resend:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send a branded OTP verification email for OceanGuardian login.
 */
export async function sendOtpEmail(
    apiKey: string,
    to: string,
    code: string
): Promise<{ success: boolean; error?: string }> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1e293b,#0f172a);border:1px solid rgba(6,182,212,0.2);border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px;text-align:center;">
              <div style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#2563eb);padding:12px;border-radius:12px;margin-bottom:16px;">
                <span style="font-size:28px;">🌊</span>
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">OceanGuardian</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Protecting our oceans, one guardian at a time</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 8px;font-size:16px;color:#e2e8f0;">Your verification code is:</p>
              <div style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
                <span style="font-size:36px;font-weight:700;letter-spacing:0.3em;color:#06b6d4;font-family:'Courier New',monospace;">${code}</span>
              </div>
              <p style="margin:16px 0 0;font-size:14px;color:#94a3b8;">This code will expire in <strong style="color:#e2e8f0;">10 minutes</strong>.</p>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">If you didn't request this code, you can safely ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:12px;color:#64748b;">🐠 OceanGuardian — Marine Conservation Platform</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    return sendEmail(apiKey, {
        from: "OceanGuardian <onboarding@resend.dev>",
        to,
        subject: `${code} — Your OceanGuardian Login Code`,
        html,
    });
}
