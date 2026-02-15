const amqp = require("amqplib");

let channel;
let connection;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
    });

    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      setTimeout(connectRabbitMQ, 5000); // retry
    });

    channel = await connection.createChannel();

    await channel.assertQueue("email_queue", { durable: true });

    console.log("✅ RabbitMQ connected");
  } catch (error) {
    console.error("❌ RabbitMQ connection failed:", error);
    setTimeout(connectRabbitMQ, 5000); // retry after delay
  }
}

function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ not connected");
  }
  return channel;
}

async function closeRabbitMQ() {
  if (channel) await channel.close();
  if (connection) await connection.close();
}

module.exports = { connectRabbitMQ, getChannel, closeRabbitMQ };
