import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface SendContactEmailParams {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly toEmail: string;
  private readonly replyToEmail: string;
  private initialized = false;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL ?? '';
    this.toEmail = process.env.RESEND_TO_EMAIL ?? '';
    this.replyToEmail = process.env.RESEND_REPLY_TO_EMAIL ?? this.fromEmail;

    if (apiKey && this.fromEmail && this.toEmail) {
      this.resend = new Resend(apiKey);
      this.initialized = true;
      this.logger.log('EmailService initialized with Resend');
    } else {
      this.logger.warn(
        'EmailService not fully configured. Missing RESEND_API_KEY, RESEND_FROM_EMAIL, or RESEND_TO_EMAIL.',
      );
      // Create a stub instance to prevent runtime errors
      this.resend = new Resend('re_stub_inactive');
    }
  }

  get isConfigured(): boolean {
    return this.initialized;
  }

  async sendContactNotification(params: SendContactEmailParams): Promise<EmailResult> {
    if (!this.initialized) {
      this.logger.error('Cannot send email: Resend is not configured');
      return {
        success: false,
        error: 'Email service is not configured. Please set RESEND_API_KEY, RESEND_FROM_EMAIL, and RESEND_TO_EMAIL.',
      };
    }

    const { name, email, phone, subject, message } = params;

    const phoneLine = phone ? `\nPhone: ${phone}` : '';
    const plainTextBody = `New Contact Form Submission
==============================

Name: ${name}
Email: ${email}${phoneLine}
Subject: ${subject}

Message:
--------
${message}
`;

    const htmlBody = this.buildContactEmailHtml(name, email, phone, subject, message);

    this.logger.log(`Sending contact notification email for: ${name} <${email}>`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [this.toEmail],
        replyTo: email,
        subject: `[Spiritual Woman Contact] ${subject}`,
        text: plainTextBody,
        html: htmlBody,
      });

      if (error) {
        this.logger.error(`Resend API error: ${error.message}`, error);
        return {
          success: false,
          error: error.message,
        };
      }

      this.logger.log(`Contact notification email sent successfully. Message ID: ${data?.id}`);
      return {
        success: true,
        messageId: data?.id,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending email';
      this.logger.error(`Failed to send email: ${errorMessage}`, err);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private buildContactEmailHtml(
    name: string,
    email: string,
    phone: string | undefined,
    subject: string,
    message: string,
  ): string {
    const sanitized = (text: string) =>
      text
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;');

    const phoneHtml = phone ? `<p><strong>Phone:</strong> ${sanitized(phone)}</p>` : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #b91c5c, #e11d48); padding: 28px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; }
    .content { padding: 28px 32px; }
    .field { margin-bottom: 18px; }
    .field-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #1f2937; line-height: 1.5; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .message-box { background: #f9fafb; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 14px; color: #374151; line-height: 1.6; }
    .footer { padding: 20px 32px; background: #f3f4f6; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✝ New Contact Message</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${sanitized(name)}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${sanitized(email)}">${sanitized(email)}</a></div>
      </div>
      ${phoneHtml}
      <div class="field">
        <div class="field-label">Subject</div>
        <div class="field-value">${sanitized(subject)}</div>
      </div>
      <hr class="divider" />
      <div class="field">
        <div class="field-label">Message</div>
        <div class="message-box">${sanitized(message)}</div>
      </div>
    </div>
    <div class="footer">
      Sent from the Spiritual Woman website contact form
    </div>
  </div>
</body>
</html>`;
  }
}