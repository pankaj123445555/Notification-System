const { getPool } = require("../config/db");

/**
 * Fetch latest active template by code
 */
const getTemplate = async (applicationId, templateCode) => {
  const pool = getPool();

  const result = await pool.query(
    `SELECT *
     FROM templates
     WHERE application_id = $1
       AND template_code = $2
       AND is_active = true
     ORDER BY version DESC
     LIMIT 1`,
    [applicationId, templateCode],
  );

  if (result.rows.length === 0) {
    throw new Error(
      `Template not found: ${templateCode} for application ${applicationId}`,
    );
  }

  return result.rows[0];
};

/**
 * Render template string using payload
 * Example:
 * "Hello {{name}}" + { name: "Pankaj" }
 */
const renderTemplate = (templateString, payload) => {
  if (!templateString) return "";

  return templateString.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    if (payload[key] === undefined || payload[key] === null) {
      throw new Error(`Missing template variable: ${key}`);
    }
    return payload[key];
  });
};

/**
 * Render full email content
 */
const renderEmail = (template, payload) => {
  const subject = renderTemplate(template.subject, payload);
  const html = renderTemplate(template.body, payload);

  // Basic HTML → text fallback
  const text = html.replace(/<[^>]+>/g, "");

  return {
    subject,
    html,
    text,
  };
};

module.exports = {
  getTemplate,
  renderTemplate,
  renderEmail,
};
