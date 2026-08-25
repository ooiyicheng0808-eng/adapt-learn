import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "noreply@example.com";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!host || !user || !pass) {
    console.error("Missing SMTP credentials in environment variables.");
    throw new Error("Email service is not properly configured");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports like 587
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `"Education Platform" <${from}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Code</h2>
      <p>You requested a password reset for your account.</p>
      <p>Here is your 4-digit reset code:</p>
      <h1 style="font-size: 36px; letter-spacing: 4px; color: #333;">${token}</h1>
      <p>This code will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
