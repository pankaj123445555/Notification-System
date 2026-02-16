// config/rabbitmq.js
const amqp = require("amqplib");

let channel;
let connection;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    connection.on("error", (err) => {
      console.error("RabbitMQ error:", err);
    });

    connection.on("close", () => {
      console.error("RabbitMQ closed. Reconnecting...");
      setTimeout(connectRabbitMQ, 5000);
    });

    channel = await connection.createChannel();
    await channel.prefetch(1);

    await channel.assertQueue("email_queue", { durable: true });

    console.log("RabbitMQ connected");
  } catch (err) {
    console.error("RabbitMQ connection failed:", err);
    setTimeout(connectRabbitMQ, 5000);
  }
}

function getChannel() {
  if (!channel) throw new Error("RabbitMQ not connected");
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
