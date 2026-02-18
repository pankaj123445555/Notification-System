const amqp = require("amqplib");

let connection;
let channel;

const QUEUE_NAME = process.env.EMAIL_QUEUE;
const DLX_NAME = process.env.EMAIL_DLX;
const DLQ_NAME = process.env.EMAIL_DLQ;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
    });

    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      setTimeout(connectRabbitMQ, 5000);
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      console.error("RabbitMQ channel error:", err);
    });

    channel.on("close", () => {
      console.warn("RabbitMQ channel closed");
    });

    await channel.prefetch(5);

    /**
     * DLX setup
     */
    await channel.assertExchange(DLX_NAME, "direct", {
      durable: true,
    });

    await channel.assertQueue(DLQ_NAME, {
      durable: true,
    });

    await channel.bindQueue(DLQ_NAME, DLX_NAME, "email_dead");

    /**
     * Main queue
     */
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      deadLetterExchange: DLX_NAME,
      deadLetterRoutingKey: "email_dead",
    });

    console.log("✅ RabbitMQ connected & configured");
  } catch (err) {
    console.error("RabbitMQ connection failed:", err);
    setTimeout(connectRabbitMQ, 5000);
  }
}

function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
}

async function closeRabbitMQ() {
  if (channel) await channel.close();
  if (connection) await connection.close();
}

process.on("SIGINT", async () => {
  console.log("Closing RabbitMQ connection...");
  await closeRabbitMQ();
  process.exit(0);
});

module.exports = {
  connectRabbitMQ,
  getChannel,
};
