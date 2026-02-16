const { getPool } = require("../config/db");

const authenticateApp = async (req, res, next) => {
  try {
    const pool = getPool();
    const apiKey = req.headers["x-api-key"];

    console.log("Received API key:", apiKey, !apiKey);

    if (!apiKey) {
      return res.status(401).json({ message: "API key missing" });
    }

    const result = await pool.query(
      "SELECT * FROM applications WHERE api_key = $1",
      [apiKey],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    req.application = result.rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticateApp;
