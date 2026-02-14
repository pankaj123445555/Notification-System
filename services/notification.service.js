const pool = require("../config/db");
const templateService = require("../services/template.service");

exports.createEmailNotification = async ({
  application,
  template_code,
  user_id,
  recipient,
  payload,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Fetch template
    const template = await templateService.getTemplate(
      application.id,
      template_code,
    );

    // Insert notification
    const notificationResult = await client.query(
      `INSERT INTO notifications 
       (application_id, user_id, template_id, payload) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [application.id, user_id, template.id, payload],
    );

    const notification = notificationResult.rows[0];

    // Insert delivery
    await client.query(
      `INSERT INTO notification_deliveries 
       (notification_id, channel, recipient) 
       VALUES ($1, 'email', $2)`,
      [notification.id, recipient],
    );

    await client.query("COMMIT");

    return notification;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
