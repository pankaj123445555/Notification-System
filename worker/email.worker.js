require("dotenv").config();

const { connectRabbitMQ, getChannel } = require("../config/rabbitmq");
const { getPool, connectDB } = require("../config/db");

async function startEmailWorker() {
  await connectDB();
  const pool = getPool();
  await connectRabbitMQ();
  const channel = getChannel();

  channel.consume("email_queue", async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    console.log("Processing job:", data);

    // try {
    //   /**
    //    * 1. Send email (use nodemailer / SES / SendGrid later)
    //    */
    //   console.log(`Sending email to ${data.recipient}`);

    //   /**
    //    * 2. Update delivery status
    //    */
    //   await pool.query(
    //     `UPDATE notification_deliveries
    //      SET status = 'sent', sent_at = NOW()
    //      WHERE notification_id = $1`,
    //     [data.notification_id]
    //   );

    //   /**
    //    * 3. ACK message
    //    */
    //   channel.ack(msg);
    // } catch (error) {
    //   console.error("Email failed:", error);

    //   /**
    //    * 4. Retry or dead-letter
    //    */
    //   channel.nack(msg, false, true); // requeue
    // }
  });
}

startEmailWorker();
