import nodemailer from "nodemailer";

/**
 * Transactional email for high-priority events (task assigned, role changes,
 * PR merged, etc.). When SMTP_* variables are absent, sending is skipped so
 * local development never blocks on credentials.
 */
let transporter = null;
let transportConfigured = null;

function getTransporter() {
  if (transportConfigured !== null) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) {
    transportConfigured = false;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  transportConfigured = true;
  return transporter;
}

/** Fire-and-forget: never throws, always resolves. */
export async function sendMail({ to, subject, text, html }) {
  try {
    const transport = getTransporter();
    if (!transport) {
      console.info(`[email] skipped (SMTP not configured): "${subject}" -> ${to}`);
      return { skipped: true };
    }
    const from = process.env.SMTP_FROM || "Matrix <no-reply@matrix.app>";
    const info = await transport.sendMail({ from, to, subject, text, html });
    return info;
  } catch (error) {
    console.error("[email] send failed:", error.message);
    return { error: error.message };
  }
}

export default { sendMail };
