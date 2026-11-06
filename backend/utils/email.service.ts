import nodemailer from "nodemailer";
import { env } from "../src/config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface SendTeacherInviteOptions {
  toEmail: string;
  teacherName: string;
  departmentName?: string | undefined;
  setupCode: string;
}

export async function sendTeacherInviteEmail({
  toEmail,
  teacherName,
  departmentName,
  setupCode,
}: SendTeacherInviteOptions): Promise<void> {
  const deptText = departmentName ? ` (${departmentName} Department)` : "";
  const mailOptions = {
    from: env.SMTP_FROM,
    to: toEmail,
    subject: "Invitation to Join AMS Portal - Setup Your Account",
    text: `Hello ${teacherName},

You have been invited to join the Attendance Management System (AMS) as a Faculty Member${deptText}.

Your 6-Digit Setup Code: ${setupCode}

To activate your account:
1. Open the AMS Mobile App.
2. On the Sign In screen, tap "Set password with HOD setup code".
3. Enter your email (${toEmail}), this 6-digit setup code, and your new password.

This setup code will expire in 48 hours.

Best regards,
AMS Administration`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #4f46e5; margin: 0;">AMS Portal</h2>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Attendance Management System</p>
        </div>

        <p style="font-size: 16px; color: #1e293b;">Hello <strong>${teacherName}</strong>,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.5;">
          You have been registered as a Faculty Member${deptText} on the AMS Portal.
        </p>

        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your 6-Digit Activation Code</span>
          <div style="font-size: 32px; font-weight: 700; color: #4f46e5; letter-spacing: 6px; margin: 10px 0;">${setupCode}</div>
          <span style="font-size: 12px; color: #94a3b8;">Valid for 48 hours</span>
        </div>

        <h3 style="color: #1e293b; font-size: 15px; margin-bottom: 8px;">Next steps to activate your account:</h3>
        <ol style="color: #334155; font-size: 14px; line-height: 1.6; padding-left: 20px;">
          <li>Open the <strong>AMS Mobile App</strong> on your device.</li>
          <li>On the Login screen, tap <strong>"Set password with HOD setup code"</strong>.</li>
          <li>Enter your registered email (<code>${toEmail}</code>), your 6-digit setup code, and create your password.</li>
        </ol>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          If you did not request or expect this account, please ignore this email or contact your administrator.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
