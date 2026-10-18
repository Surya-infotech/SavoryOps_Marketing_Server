const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        subject: {
            type: String,
            trim: true,
            default: "General Inquiry"
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true
        },
        createdAt: {
            type: String,
            default: () => new Date().toISOString()
        }
    }
);

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

module.exports = ContactUs;
