const express = require("express");
const supportRouter = express.Router();
const supportController = require("../../controllers/AdminPanel/Support/support-controller");
const { authMiddleware } = require("../../middlewares/auth-middleware");

// Public endpoints (used by marketing website)
supportRouter.route("/AddWhiteLabel").post(supportController.add_white_label);
supportRouter.route("/AddContactUs").post(supportController.add_contact_us);
supportRouter.route("/AddSubscriber").post(supportController.add_subscriber);

// Protected endpoints (used by admin panel)
supportRouter.route("/GetWhiteLabel").get(authMiddleware, supportController.get_white_label);
supportRouter.route("/UpdateWhiteLabelStatus/:id").put(authMiddleware, supportController.update_white_label_status);

supportRouter.route("/GetContactUs").get(authMiddleware, supportController.get_contact_us);
supportRouter.route("/GetSubscribers").get(authMiddleware, supportController.get_subscribers);

module.exports = supportRouter;
