const MiscSetting = require("../../../../models/AdminPanel/System/Setting/miscsetting-model");

const get_misc_setting = async (_req, res) => {
    try {
        let miscSetting = await MiscSetting.findOne();

        if (!miscSetting) {
            miscSetting = await MiscSetting.create({
                timeZone: "Asia/Kolkata",
                dateFormat: "DD/MM/YYYY",
                timeFormat: "hh:mm A"
            });
        }

        return res.status(200).json(miscSetting);
    } catch (error) {
        console.log("Error retrieving misc setting:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const update_misc_setting = async (req, res) => {
    try {
        const { timeZone, dateFormat, timeFormat } = req.body;

        let miscSetting = await MiscSetting.findOne();

        if (miscSetting) {
            const updateData = {};
            if (timeZone !== undefined) updateData.timeZone = timeZone;
            if (dateFormat !== undefined) updateData.dateFormat = dateFormat;
            if (timeFormat !== undefined) updateData.timeFormat = timeFormat;

            miscSetting = await MiscSetting.findOneAndUpdate(
                { _id: miscSetting._id },
                updateData,
                { returnDocument: 'after' }
            );
        } else {
            miscSetting = new MiscSetting({
                timeZone: timeZone || "Asia/Kolkata",
                dateFormat: dateFormat || "DD/MM/YYYY",
                timeFormat: timeFormat || "hh:mm A"
            });

            await miscSetting.save();
        }

        return res.status(200).json(miscSetting);
    } catch (error) {
        console.log("Error updating misc setting:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { get_misc_setting, update_misc_setting };
