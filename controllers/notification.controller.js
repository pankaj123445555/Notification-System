const notificationService = require("../services/notification.service");

const sendEmail = async (req, res, next) => {
  try {
    const { template_code, user_id, recipient, payload } = req.body;

    console.log("Request bodys:", req.body);

    const notification = await notificationService.createEmailNotification({
      application: req.application,
      template_code,
      user_id,
      recipient,
      payload,
    });

    res.status(201).json({
      message: "Notification queued successfully",
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendEmail,
};
