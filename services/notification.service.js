const { getPool } = require("../config/db");
const templateService = require("../services/template.service");
const { getChannel } = require("../config/rabbitmq");

exports.createEmailNotification = async ({
  application,
  template_code,
  user_id,
  recipient,
  payload,
}) => {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    // Fetch template
    const template = await templateService.getTemplate(
      application.id,
      template_code,
    );

    const { subject, html, text } = templateService.renderEmail(
      template,
      payload,
    );
    console.log("Template fetched:", template);
    console.log("Rendered Email:", { subject, html, text });

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

    const channel = getChannel();

    channel.sendToQueue(
      "email_queue",
      Buffer.from(
        JSON.stringify({
          notification_id: notification.id,
          recipient,
          subject,
          html,
          text,
        }),
      ),
      { persistent: true },
    );

    return notification;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
