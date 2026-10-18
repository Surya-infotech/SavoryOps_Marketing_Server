const mongoose = require("mongoose");

const whiteLabelSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        company: {
            type: String,
            trim: true,
            default: ""
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },
        licenseModel: {
            type: String,
            trim: true,
            default: "Source Code + Turnkey Cloud Setup"
        },
        timeline: {
            type: String,
            trim: true,
            default: "Within 7 Days"
        },
        message: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ["Pending", "Contacted", "In Progress", "Closed"],
            default: "Pending"
        },
        ipAddress: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const WhiteLabel = mongoose.model("WhiteLabel", whiteLabelSchema);

module.exports = WhiteLabel;
