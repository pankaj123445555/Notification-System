const pool = require("../config/db");

getTemplate = async (applicationId, templateCode) => {
  const result = await pool.query(
    `SELECT * FROM templates 
     WHERE application_id = $1 
     AND template_code = $2 
     AND is_active = true
     ORDER BY version DESC
     LIMIT 1`,
    [applicationId, templateCode],
  );

  if (result.rows.length === 0) {
    throw new Error("Template not found");
  }

  return result.rows[0];
};

module.exports = {
  getTemplate,
};
