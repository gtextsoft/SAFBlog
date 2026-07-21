import "server-only";

import { Resend } from "resend";

import { absoluteUrl, CONTACT_EMAIL, SITE_NAME } from "@/lib/seo/site";

/** Strip accidental quotes/whitespace from .env values. */
function env(name: string): string {
  const raw = process.env[name];
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "");
}

function getResend(): Resend | null {
  const key = env("RESEND_API_KEY");
  if (!key) return null;
  return new Resend(key);
}

export function resendFrom(): string {
  const email = env("RESEND_FROM_EMAIL") || CONTACT_EMAIL;
  const name = env("RESEND_FROM_NAME") || SITE_NAME;
  return `${name} <${email}>`;
}

export function isEmailConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY") && (env("RESEND_FROM_EMAIL") || CONTACT_EMAIL));
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "Email is not configured (RESEND_API_KEY)." };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: resendFrom(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
      headers: opts.headers,
    });

    if (error) {
      console.error("sendEmail", error);
      return {
        ok: false,
        error:
          error.message ||
          "Resend rejected the message. Verify your domain and RESEND_FROM_EMAIL in the Resend dashboard.",
      };
    }

    if (!data?.id) {
      return { ok: false, error: "Resend returned no message id." };
    }

    return { ok: true };
  } catch (err) {
    console.error("sendEmail exception", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unexpected email send failure.",
    };
  }
}

export function confirmationEmailHtml(confirmUrl: string): string {
  return `
    <p>Confirm your subscription to ${SITE_NAME} stories.</p>
    <p><a href="${confirmUrl}">Confirm email address</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;
}

export function campaignEmailHtml(
  bodyHtml: string,
  unsubscribeUrl: string,
  preheader?: string,
): string {
  const preheaderBlock = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeAttr(preheader)}</div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#f6f5f2;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  ${preheaderBlock}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f2;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e2dc;">
          <tr>
            <td style="padding:28px 28px 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#666;">
              ${escapeAttr(SITE_NAME)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-size:16px;line-height:1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 28px;border-top:1px solid #e5e2dc;font-size:12px;line-height:1.5;color:#666;">
              You are receiving this because you subscribed to ${escapeAttr(SITE_NAME)}.
              <a href="${unsubscribeUrl}" style="color:#1d4ed8;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function unsubscribeUrl(token: string, email: string): string {
  return (
    absoluteUrl("/unsubscribe") +
    `?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  );
}

export function confirmUrl(token: string, email: string): string {
  return (
    absoluteUrl("/newsletter/confirm") +
    `?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  );
}
