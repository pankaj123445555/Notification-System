require("dotenv").config();

const app = require("./app");
const { connectRabbitMQ } = require("./config/rabbitmq");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB(); // Connect DB first
    await connectRabbitMQ(); // Connect MQ

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
