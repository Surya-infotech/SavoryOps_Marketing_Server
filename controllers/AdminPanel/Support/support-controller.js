const WhiteLabel = require("../../../models/AdminPanel/Support/whitelabel-model");
const ContactUs = require("../../../models/AdminPanel/Support/contactus-model");
const Subscriber = require("../../../models/AdminPanel/Support/subscriber-model");

// ============================================================================
// 1. WHITE-LABEL INQUIRIES
// ============================================================================

/**
 * Public: Submit a new White-Label / Commercial License Inquiry
 */
const add_white_label = async (req, res) => {
    try {
        const { fullName, company, email, phone, licenseModel, timeline, message } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ success: false, message: "Full Name is required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: "Business Email is required" });
        }
        if (!phone || !phone.trim()) {
            return res.status(400).json({ success: false, message: "Phone / WhatsApp number is required" });
        }

        const newInquiry = await WhiteLabel.create({
            fullName: fullName.trim(),
            company: (company || "").trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            licenseModel: (licenseModel || "Source Code + Turnkey Cloud Setup").trim(),
            timeline: (timeline || "Within 7 Days").trim(),
            message: (message || "").trim(),
            status: "Pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        return res.status(201).json({
            success: true,
            message: "Inquiry submitted successfully",
            data: newInquiry
        });
    } catch (error) {
        console.error("Error in add_white_label:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit inquiry",
            error: error.message
        });
    }
};

/**
 * Protected: Get all White-Label Inquiries (for Admin Panel)
 */
const get_white_label = async (_req, res) => {
    try {
        const inquiries = await WhiteLabel.find().sort({ createdAt: -1 });
        return res.status(200).json(inquiries);
    } catch (error) {
        console.error("Error in get_white_label:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Protected: Get single White-Label Inquiry by ID
 */
const get_white_label_by_id = async (req, res) => {
    try {
        const { id } = req.params;
        const inquiry = await WhiteLabel.findById(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        return res.status(200).json(inquiry);
    } catch (error) {
        console.error("Error in get_white_label_by_id:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Protected: Update status of a White-Label Inquiry
 */
const update_white_label_status = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["Pending", "Contacted", "In Progress", "Closed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updated = await WhiteLabel.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date().toISOString() },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: updated
        });
    } catch (error) {
        console.error("Error in update_white_label_status:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Protected: Delete a White-Label Inquiry
 */
const delete_white_label = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await WhiteLabel.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        return res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
    } catch (error) {
        console.error("Error in delete_white_label:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ============================================================================
// 2. CONTACT US
// ============================================================================

/**
 * Protected: Get all Contact Us messages
 */
const get_contact_us = async (_req, res) => {
    try {
        const contacts = await ContactUs.find().sort({ createdAt: -1 });
        return res.status(200).json(contacts);
    } catch (error) {
        console.error("Error in get_contact_us:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Public: Submit a Contact Us message
 */
const add_contact_us = async (req, res) => {
    try {
        const { fullname, fullName, name, email, phone, subject, message } = req.body;
        const resolvedName = (fullname || fullName || name || "").trim();
        if (!resolvedName) {
            return res.status(400).json({ success: false, message: "Full Name is required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: "Email address is required" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: "Please enter a valid email address." });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }
        const created = await ContactUs.create({
            fullname: resolvedName,
            email: email.trim().toLowerCase(),
            phone: (phone || "").trim(),
            subject: (subject || "General Inquiry").trim(),
            message: message.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return res.status(201).json({
            success: true,
            message: "Thank you for contacting SavoryOps! We have received your message and will get back to you shortly.",
            data: created
        });
    } catch (error) {
        console.error("Error in add_contact_us:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ============================================================================
// 3. SUBSCRIBERS
// ============================================================================

/**
 * Protected: Get all Subscribers
 */
const get_subscribers = async (_req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        return res.status(200).json(subscribers);
    } catch (error) {
        console.error("Error in get_subscribers:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Public: Add Subscriber
 */
const add_subscriber = async (req, res) => {
    try {
        const { email, source } = req.body;
        if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ success: false, message: "Email address is required." });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: "Please enter a valid business email." });
        }

        const existing = await Subscriber.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "You are already subscribed to our newsletter!",
                alreadySubscribed: true,
                data: existing
            });
        }
        const created = await Subscriber.create({
            email: normalizedEmail,
            source: source || "Marketing Website",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return res.status(201).json({
            success: true,
            message: "Thank you for subscribing! You're all set to receive industry insights.",
            data: created
        });
    } catch (error) {
        console.error("Error in add_subscriber:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

/**
 * Protected: Delete Subscriber
 */
const delete_subscriber = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Subscriber.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Subscriber not found" });
        }
        return res.status(200).json({ success: true, message: "Subscriber deleted successfully" });
    } catch (error) {
        console.error("Error in delete_subscriber:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    add_white_label,
    get_white_label,
    get_white_label_by_id,
    update_white_label_status,
    delete_white_label,
    get_contact_us,
    add_contact_us,
    get_subscribers,
    add_subscriber,
    delete_subscriber
};
