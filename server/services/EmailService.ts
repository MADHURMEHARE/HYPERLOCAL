import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: any = null;

  /**
   * Lazy-initializes and returns the nodemailer SMTP transporter.
   * If SMTP_PASSWORD (the Resend API Key) or SMTP_USER are missing,
   * it returns null and we fall back to logging emails to the console.
   */
  private static getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST || 'smtp.resend.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || 'resend';
    const password = process.env.SMTP_PASSWORD;

    if (!password) {
      console.warn(
        '⚠️ EmailService: SMTP_PASSWORD (your Resend API Key) is not defined. ' +
        'Emails will be logged to the server console instead of being sent.'
      );
      return null;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for port 465, false for other ports (587)
        auth: {
          user,
          pass: password,
        },
      });
      return this.transporter;
    } catch (error) {
      console.error('❌ EmailService: Failed to initialize nodemailer transporter:', error);
      return null;
    }
  }

  /**
   * Helper to send an HTML email.
   */
  private static async sendEmail(to: string, subject: string, html: string, text: string, isRetry = false): Promise<boolean> {
    const from = process.env.SMTP_FROM || 'onboarding@resend.dev';
    const transporter = this.getTransporter();

    if (!transporter) {
      console.log('--- 📧 MOCK EMAIL SENT (Resend SMTP Not Configured) ---');
      console.log(`To:      ${to}`);
      console.log(`From:    ${from}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${text}`);
      console.log('------------------------------------------------------');
      return true;
    }

    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`✨ Email successfully sent to ${to} via Resend SMTP! Message ID: ${info.messageId}`);
      return true;
    } catch (error: any) {
      const errStr = error.message || '';
      const isSandboxRestriction = errStr.includes('550') || errStr.includes('testing emails') || errStr.includes('verify a domain');
      
      if (isSandboxRestriction && !isRetry) {
        // Try to extract the owner's verified email from Resend's error message
        const match = errStr.match(/your own email address \(([^)]+)\)/i);
        if (match && match[1]) {
          const ownerEmail = match[1].trim();
          console.warn(`\n🔄 [Resend Sandbox Redirect] Re-routing email intended for <${to}> to your verified Resend account email <${ownerEmail}>...`);
          
          const modifiedSubject = `[Sandbox: ${to}] ${subject}`;
          const modifiedHtml = `
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; color: #78350f; padding: 16px; margin-bottom: 24px; border-radius: 8px; font-family: sans-serif; font-size: 14px;">
              <strong>Resend Sandbox Redirection Notice:</strong> This email was originally sent to <strong>${to}</strong>. 
              Because your Resend account does not have a verified domain, it was automatically re-routed to your registered Resend email address.
            </div>
            ${html}
          `;
          const modifiedText = `[Sandbox Redirection - Originally sent to ${to}]\n\n${text}`;
          
          return this.sendEmail(ownerEmail, modifiedSubject, modifiedHtml, modifiedText, true);
        }
      }

      if (isSandboxRestriction) {
        console.warn('\n========================================================================');
        console.warn('⚠️  RESEND SMTP SANDBOX LIMITATION');
        console.warn(`To:      ${to}`);
        console.warn(`Subject: ${subject}`);
        console.warn(`Status:  Blocked by Resend Sandbox (recipient not verified)`);
        console.warn(`How to Fix:`);
        console.warn(` 1. Verify your custom domain at: https://resend.com/domains`);
        console.warn(` 2. Or, test registration/login using your Resend account email.`);
        console.warn('========================================================================\n');
      } else {
        console.error(`❌ EmailService failed to send email to ${to}:`, error);
      }
      
      // Fallback to console log so app flows don't crash
      console.log('--- 📧 FALLBACK MOCK EMAIL (Due to Sandbox/Send Failure) ---');
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${text}`);
      console.log('----------------------------------------------------');
      return false;
    }
  }

  /**
   * Send a beautiful, responsive welcome email upon registration.
   */
  static async sendWelcomeEmail(toEmail: string, name: string): Promise<boolean> {
    const subject = 'Welcome to HyperLocal - Let\'s Build a Better Community Together!';
    
    const text = `Hello ${name},\n\nWelcome to HyperLocal! We are thrilled to have you join our civic engagement platform.\n\nWith HyperLocal, you can report local infrastructure hazards, track repair progress, vote on urgent community issues, and earn municipal contribution points!\n\nBest regards,\nThe HyperLocal Team`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to HyperLocal</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9fafb;
              color: #111827;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            }
            .header {
              background-color: #0f172a;
              color: #ffffff;
              padding: 32px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: -0.025em;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              color: #94a3b8;
            }
            .content {
              padding: 32px;
              line-height: 1.6;
              font-size: 16px;
            }
            .content p {
              margin-top: 0;
              margin-bottom: 20px;
            }
            .highlight-box {
              background-color: #f8fafc;
              border-left: 4px solid #3b82f6;
              padding: 20px;
              margin: 24px 0;
              border-radius: 0 8px 8px 0;
            }
            .highlight-box h3 {
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: #1e3a8a;
            }
            .highlight-box ul {
              margin: 0;
              padding-left: 20px;
              color: #334155;
            }
            .highlight-box li {
              margin-bottom: 6px;
            }
            .button-wrapper {
              text-align: center;
              margin: 32px 0;
            }
            .btn {
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff !important;
              text-decoration: none;
              padding: 12px 28px;
              font-weight: 600;
              border-radius: 8px;
              font-size: 15px;
              box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
              transition: background-color 0.2s;
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HyperLocal</h1>
              <p>Your Neighborhood Civic Connection Engine</p>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Welcome to <strong>HyperLocal</strong>! We're thrilled to have you join our civic engagement platform. Together, we can make our neighborhood safer, cleaner, and more vibrant.</p>
              
              <div class="highlight-box">
                <h3>What you can do with HyperLocal:</h3>
                <ul>
                  <li><strong>Report Issues:</strong> Spot potholes, broken streetlights, or waste dumps, and report them instantly.</li>
                  <li><strong>Verify & Vote:</strong> Help corroborate existing reports to move them up the priority queue.</li>
                  <li><strong>Track Solutions:</strong> Watch city workers and municipal vendors address reports in real-time.</li>
                  <li><strong>Earn Badges:</strong> Collect points and contribution badges as a top civic hero!</li>
                </ul>
              </div>

              <p>Ready to jump in? Access your dashboard and start contributing to your neighborhood today.</p>

              <div class="button-wrapper">
                <a href="${process.env.APP_URL || 'http://localhost:3000/'}" class="btn" target="_blank">Access Your Dashboard</a>
              </div>

              <p>Best regards,<br><strong>The HyperLocal Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message from HyperLocal.</p>
              <p>&copy; ${new Date().getFullYear()} HyperLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(toEmail, subject, html, text);
  }

  /**
   * Send a login notification security alert email.
   */
  static async sendLoginNotification(toEmail: string, name: string): Promise<boolean> {
    const subject = 'HyperLocal Security Alert: New Login Detected';
    const timestamp = new Date().toLocaleString();
    
    const text = `Hello ${name},\n\nWe detected a new successful sign-in to your HyperLocal account on ${timestamp}.\n\nIf this was you, no action is needed.\n\nBest regards,\nThe HyperLocal Team`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HyperLocal Security Alert</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9fafb;
              color: #111827;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            }
            .header {
              background-color: #ef4444;
              color: #ffffff;
              padding: 24px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 20px;
              font-weight: 700;
            }
            .content {
              padding: 32px;
              line-height: 1.6;
              font-size: 16px;
            }
            .content p {
              margin-top: 0;
              margin-bottom: 20px;
            }
            .details-table {
              width: 100%;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
              border-collapse: collapse;
            }
            .details-table td {
              padding: 6px 12px;
              font-size: 14px;
            }
            .details-table td.label {
              font-weight: 600;
              color: #475569;
              width: 120px;
            }
            .details-table td.value {
              color: #0f172a;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Security Alert</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>A new sign-in was detected on your HyperLocal account. Please verify the login details below:</p>
              
              <table class="details-table">
                <tr>
                  <td class="label">Account:</td>
                  <td class="value">${toEmail}</td>
                </tr>
                <tr>
                  <td class="label">Time:</td>
                  <td class="value">${timestamp}</td>
                </tr>
                <tr>
                  <td class="label">Status:</td>
                  <td class="value" style="color: #10b981; font-weight: 600;">Success</td>
                </tr>
              </table>

              <p>If this was you, no action is required. Your account is fully secured.</p>
              <p style="color: #ef4444; font-size: 14px; font-weight: 500;">If you do not recognize this activity, please change your password immediately to protect your account.</p>

              <p>Best regards,<br><strong>The HyperLocal Team</strong></p>
            </div>
            <div class="footer">
              <p>This is a security notification from HyperLocal.</p>
              <p>&copy; ${new Date().getFullYear()} HyperLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(toEmail, subject, html, text);
  }

  /**
   * Send a verification code for password reset.
   */
  static async sendPasswordResetEmail(toEmail: string, name: string, code: string): Promise<boolean> {
    const subject = 'HyperLocal: Reset Your Password';
    const text = `Hello ${name},\n\nYou have requested to reset your password. Use the following 6-digit verification code to proceed:\n\n${code}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nThe HyperLocal Team`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9fafb;
              color: #111827;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            }
            .header {
              background-color: #2563eb;
              color: #ffffff;
              padding: 24px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 20px;
              font-weight: 700;
            }
            .content {
              padding: 32px;
              line-height: 1.6;
              font-size: 16px;
            }
            .code-box {
              background-color: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 6px;
              color: #1e40af;
              margin: 24px 0;
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>We received a request to reset the password for your HyperLocal account. Please use the verification code below to authorize this action:</p>
              
              <div class="code-box">${code}</div>
              
              <p>This code is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email and your password will remain unchanged.</p>

              <p>Best regards,<br><strong>The HyperLocal Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated notification from HyperLocal.</p>
              <p>&copy; ${new Date().getFullYear()} HyperLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(toEmail, subject, html, text);
  }

  /**
   * Send a beautiful, responsive notification email when an issue's status changes.
   */
  static async sendIssueStatusUpdateEmail(
    toEmail: string,
    name: string,
    issueTitle: string,
    oldStatus: string,
    newStatus: string,
    note?: string
  ): Promise<boolean> {
    const subject = `HyperLocal Alert: Status Updated to "${newStatus}" for "${issueTitle}"`;
    
    const text = `Hello ${name},\n\nYour reported issue "${issueTitle}" has been updated from "${oldStatus}" to "${newStatus}".\n\nUpdate Details:\n${note || 'No additional notes provided.'}\n\nBest regards,\nThe HyperLocal Team`;

    const statusColors: Record<string, string> = {
      'Reported': '#ef4444',
      'Verified': '#3b82f6',
      'In Progress': '#f59e0b',
      'Resolved': '#10b981'
    };

    const accentColor = statusColors[newStatus] || '#3b82f6';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Issue Status Updated</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9fafb;
              color: #111827;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            }
            .header {
              background-color: #0f172a;
              color: #ffffff;
              padding: 32px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: -0.025em;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              color: #94a3b8;
            }
            .content {
              padding: 32px;
              line-height: 1.6;
              font-size: 16px;
            }
            .content p {
              margin-top: 0;
              margin-bottom: 20px;
            }
            .status-banner {
              background-color: ${accentColor}10;
              border-left: 4px solid ${accentColor};
              padding: 16px;
              margin: 24px 0;
              border-radius: 0 8px 8px 0;
            }
            .status-banner h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
              color: ${accentColor};
            }
            .status-banner p {
              margin: 0;
              font-size: 14px;
              color: #475569;
            }
            .status-badge {
              display: inline-block;
              background-color: ${accentColor};
              color: #ffffff;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-top: 4px;
            }
            .button-wrapper {
              text-align: center;
              margin: 32px 0;
            }
            .btn {
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff !important;
              text-decoration: none;
              padding: 12px 28px;
              font-weight: 600;
              border-radius: 8px;
              font-size: 15px;
              box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
              transition: background-color 0.2s;
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HyperLocal</h1>
              <p>Your Neighborhood Civic Connection Engine</p>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>We are writing to let you know that the status of your reported issue <strong>"${issueTitle}"</strong> has been updated.</p>
              
              <div class="status-banner">
                <h3>Status Transition:</h3>
                <p><strong>${oldStatus}</strong> &rarr; <span class="status-badge">${newStatus}</span></p>
                <p style="margin-top: 8px; font-size: 14px; color: #475569;">Reporter: <strong>${name}</strong></p>
                ${note ? `<p style="margin-top: 12px; font-style: italic;">"${note}"</p>` : ''}
              </div>

              <p>You can monitor ongoing work, view photo evidence, or add comments to coordinate with local municipal officers and vendors directly through your dashboard.</p>

              <div class="button-wrapper">
                <a href="${process.env.APP_URL || 'http://localhost:3000/'}" class="btn" target="_blank">View Issue on Dashboard</a>
              </div>

              <p>Thank you for helping to make our community safer and better for everyone!</p>
              <p>Best regards,<br><strong>The HyperLocal Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated notification from HyperLocal.</p>
              <p style="margin-top: 4px; font-size: 11px; color: #94a3b8;">This message was generated dynamically and sent exclusively to you as the citizen who reported this issue.</p>
              <p>&copy; ${new Date().getFullYear()} HyperLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(toEmail, subject, html, text);
  }

  /**
   * Send a beautiful, responsive confirmation email when a citizen reports a new issue.
   */
  static async sendIssueReportedEmail(
    toEmail: string,
    name: string,
    issueTitle: string,
    category: string,
    priority: string,
    address: string
  ): Promise<boolean> {
    const subject = `HyperLocal: Issue "${issueTitle}" Successfully Reported!`;
    
    const text = `Hello ${name},\n\nThank you for reporting "${issueTitle}" under the category "${category}" at ${address}. Your community and local municipal staff have been notified.\n\nPriority: ${priority}\n\nTrack progress on your dashboard.\n\nBest regards,\nThe HyperLocal Team`;

    const priorityColors: Record<string, string> = {
      'Critical': '#ef4444',
      'High': '#f97316',
      'Medium': '#eab308',
      'Low': '#3b82f6'
    };

    const accentColor = priorityColors[priority] || '#3b82f6';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Issue Reported Successfully</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f9fafb;
              color: #111827;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            }
            .header {
              background-color: #0f172a;
              color: #ffffff;
              padding: 32px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: -0.025em;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              color: #94a3b8;
            }
            .content {
              padding: 32px;
              line-height: 1.6;
              font-size: 16px;
            }
            .content p {
              margin-top: 0;
              margin-bottom: 20px;
            }
            .details-box {
              background-color: #f8fafc;
              border-left: 4px solid ${accentColor};
              padding: 20px;
              margin: 24px 0;
              border-radius: 0 8px 8px 0;
            }
            .details-box h3 {
              margin: 0 0 12px 0;
              font-size: 16px;
              font-weight: 600;
              color: #0f172a;
            }
            .details-grid {
              font-size: 14px;
              color: #334155;
            }
            .details-row {
              margin-bottom: 8px;
            }
            .details-label {
              font-weight: 600;
              color: #475569;
              display: inline-block;
              width: 100px;
            }
            .priority-badge {
              display: inline-block;
              background-color: ${accentColor};
              color: #ffffff;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .button-wrapper {
              text-align: center;
              margin: 32px 0;
            }
            .btn {
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff !important;
              text-decoration: none;
              padding: 12px 28px;
              font-weight: 600;
              border-radius: 8px;
              font-size: 15px;
              box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
              transition: background-color 0.2s;
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HyperLocal</h1>
              <p>Your Neighborhood Civic Connection Engine</p>
            </div>
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for doing your part! You have successfully reported a new civic issue. Your community and local municipal staff have been notified to corroborate and inspect the report.</p>
              
              <div class="details-box">
                <h3>Report Details</h3>
                <div class="details-grid">
                  <div class="details-row"><span class="details-label">Title:</span> <strong>${issueTitle}</strong></div>
                  <div class="details-row"><span class="details-label">Reporter:</span> <strong>${name}</strong></div>
                  <div class="details-row"><span class="details-label">Category:</span> ${category}</div>
                  <div class="details-row"><span class="details-label">Location:</span> ${address}</div>
                  <div class="details-row"><span class="details-label">Priority:</span> <span class="priority-badge">${priority}</span></div>
                </div>
              </div>

              <p>You can track the live progress, upvotes, community verification score, and subsequent municipal action directly on your dashboard.</p>

              <div class="button-wrapper">
                <a href="${process.env.APP_URL || 'http://localhost:3000/'}" class="btn" target="_blank">Track Issue Progress</a>
              </div>

              <p>Every citizen action counts. Together, we make our neighborhood better!</p>
              <p>Best regards,<br><strong>The HyperLocal Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated notification from HyperLocal.</p>
              <p style="margin-top: 4px; font-size: 11px; color: #94a3b8;">This message was generated dynamically and sent exclusively to you as the citizen who reported this issue.</p>
              <p>&copy; ${new Date().getFullYear()} HyperLocal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(toEmail, subject, html, text);
  }
}
