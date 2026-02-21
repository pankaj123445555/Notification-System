require("dotenv").config();

const { connectRabbitMQ, getChannel } = require("../config/rabbitmq");
const { getPool, connectDB } = require("../config/db");
const { sendEmail } = require("../utils/mailer");

async function startEmailWorker() {
  await connectDB();
  const pool = getPool();

  await connectRabbitMQ();
  const channel = getChannel();

  channel.consume(
    "email_queue",
    async (msg) => {
      if (!msg) return;

      const payload = JSON.parse(msg.content.toString());

      const { notification_id, recipient, subject, html, text } = payload;

      console.log("Received email task:", payload);

      try {
        /** 1️⃣ Send Email */
        await sendEmail({
          to: recipient,
          subject,
          html,
          text,
        });

        /** 2️⃣ Update delivery status */
        await pool.query(
          `UPDATE notification_deliveries
           SET status = 'sent',
               sent_at = NOW()
           WHERE notification_id = $1`,
          [notification_id],
        );

        /** 3️⃣ ACK message */
        channel.ack(msg);
      } catch (error) {
        console.error("Email send failed:", error.message);

        /** 4️⃣ Mark failure */
        await pool.query(
          `UPDATE notification_deliveries
           SET status = 'failed',
               error = $2
           WHERE notification_id = $1`,
          [notification_id, error.message],
        );

        /**
         * ❌ Do NOT requeue blindly
         * Send to DLQ after failure
         */
        channel.nack(msg, false, false);
      }
    },
    {
      noAck: false,
    },
  );

  console.log("📨 Email worker started");
}

startEmailWorker();
