const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
    {
        fiscalyearid: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        source: {
            type: String,
            default: "Marketing Website"
        },
        createdAt: {
            type: String,
            default: () => new Date().toISOString()
        }
    }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = Subscriber;
