const express = require("express");
const systemrouter = express.Router();
const fiscalyearcontroller = require("../../controllers/AdminPanel/System/Setting/fiscalyear-controller");
const generalsettingcontroller = require("../../controllers/AdminPanel/System/Setting/generalsetting-controller");
const miscsettingcontroller = require("../../controllers/AdminPanel/System/Setting/miscsetting-controller");
const { authMiddleware } = require("../../middlewares/auth-middleware");

// Fiscal Year Routes
systemrouter.route("/CheckCurrentFiscalYear").get(fiscalyearcontroller.check_current_fiscalyear);
systemrouter.route("/GetFiscalYear").get(authMiddleware, fiscalyearcontroller.get_fiscalyear);
systemrouter.route("/AddFiscalYear").post(authMiddleware, fiscalyearcontroller.add_fiscalyear);
systemrouter.route("/EditFiscalYear/:fiscalyearId").get(authMiddleware, fiscalyearcontroller.edit_fiscalyear);
systemrouter.route("/UpdateFiscalYear/:fiscalyearId").put(authMiddleware, fiscalyearcontroller.update_fiscalyear);
systemrouter.route("/DeleteFiscalYear/:fiscalyearId").delete(authMiddleware, fiscalyearcontroller.delete_fiscalyear);

// General Setting Routes
systemrouter.route("/GetGeneralSetting").get(authMiddleware, generalsettingcontroller.get_general_setting);
systemrouter.route("/GetGeneralSetting_landingpage").get(generalsettingcontroller.get_general_setting_for_landingpage);
systemrouter.route("/UpdateGeneralSetting").put(authMiddleware, generalsettingcontroller.update_general_setting);

// Misc Setting Routes
systemrouter.route("/GetMiscSetting").get(authMiddleware, miscsettingcontroller.get_misc_setting);
systemrouter.route("/UpdateMiscSetting").put(authMiddleware, miscsettingcontroller.update_misc_setting);

module.exports = systemrouter;
