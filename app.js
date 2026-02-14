const express = require("express");
const pool = require("./config/db");

const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const applicationRoutes = require("./Routes/notification.routes");
app.use("/api/v1", applicationRoutes);

module.exports = app;
