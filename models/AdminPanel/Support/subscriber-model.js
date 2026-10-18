const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        source: {
            type: String,
            default: "Marketing Website"
        }
    },
    {
        timestamps: true
    }
);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = Subscriber;
