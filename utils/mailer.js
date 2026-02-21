const nodemailer = require("nodemailer");

let transporter;

function createTransporter() {
  if (transporter) return transporter;
  console.log(
    "Creating new SMTP transporter...",
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
  );
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
  });

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const mailer = createTransporter();

  return mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendEmail };
