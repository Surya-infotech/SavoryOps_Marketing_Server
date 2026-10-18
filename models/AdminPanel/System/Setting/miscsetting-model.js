const mongoose = require("mongoose");

const miscsettingSchema = new mongoose.Schema({
    timeZone: { type: String, required: true },
    dateFormat: { type: String, required: true },
    timeFormat: { type: String, required: true }
});

const MiscSettingModel = mongoose.model("MiscSetting", miscsettingSchema);

module.exports = MiscSettingModel;