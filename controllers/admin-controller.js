const Employee = require("../models/AdminPanel/User/employee-model");
const LoginActivity = require("../models/loginactivity-model");
const MiscSetting = require("../models/AdminPanel/System/Setting/miscsetting-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

// Verify Token (Used on page reload / app initialization)
const verifyToken = async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1] || authHeader;

    if (!token) return res.status(401).json({ message: "Token missing" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY || "savoryopsmarketing_secret_jwt_key_super_secure");
        const userId = decoded.adminId || decoded.employeeId || decoded.id;
        const employee = await Employee.findById(userId);

        if (!employee || employee.Token !== token || employee.status === false) {
            return res.status(401).json({ message: "Invalid or expired session token" });
        }

        const employeeData = employee.toObject();
        delete employeeData.password;

        return res.status(200).json({
            message: "Token is valid",
            role: employee.role,
            employee: employeeData,
            admin: employeeData
        });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Sign In (Login using Employee table)
const login_admin = async (req, res) => {
    try {
        const { email, password, browserdetails, ipaddress, device, location } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const employee = await Employee.findOne({ email: cleanEmail });
        if (!employee) {
            return res.status(404).json({ message: "Invalid Email" });
        }

        if (employee.status === false) {
            return res.status(403).json({ message: "Your account is inactive. Please contact administrator." });
        }

        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        const token = employee.generateToken();

        employee.Token = token;
        employee.updatedAt = new Date().toISOString();
        await employee.save();

        try {
            const maxAct = await LoginActivity.findOne().sort({ loginacitivityid: -1 }).lean();
            const nextActId = maxAct && !isNaN(maxAct.loginacitivityid) ? Number(maxAct.loginacitivityid) + 1 : 1;
            await LoginActivity.create({
                loginacitivityid: nextActId,
                employeeid: employee.employeeid,
                email: employee.email,
                login: new Date().toISOString(),
                browserdetails: browserdetails || "Web Browser",
                ipaddress: ipaddress || req.ip || "127.0.0.1",
                device: device || "Desktop",
                location: location || "Unknown"
            });
        } catch (actErr) {
            console.error("Error creating login activity:", actErr);
        }

        const employeeData = employee.toObject();
        delete employeeData.password;

        return res.status(200).json({
            message: "Login successful",
            token,
            adminId: employee._id,
            employeeId: employee._id,
            role: employee.role,
            firstname: employee.firstname,
            lastname: employee.lastname,
            email: employee.email,
            permissions: employee.permissions || {},
            employee: employeeData,
            admin: employeeData
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
};

// Fetch User Profile Details
const getAdminDetailsById = async (req, res) => {
    try {
        const EmployeeId = req.params.EmployeeId;
        if (!EmployeeId) return res.status(400).json({ message: "EmployeeId is required" });

        const employee = await Employee.findOne({ _id: EmployeeId });

        if (!employee) {
            return res.status(404).json({ message: "User not found" });
        }

        const userDetails = {
            _id: employee._id,
            firstname: employee.firstname || "",
            lastname: employee.lastname || "",
            adminfirstname: employee.firstname || "",
            adminlastname: employee.lastname || "",
            email: employee.email || "",
            phone: employee.phone || "",
            role: employee.role || "Employee",
            status: employee.status,
            gender: employee.gender || "Male",
            profileimage: "",
            createdAt: employee.createdAt || "",
            updatedAt: employee.updatedAt || ""
        };

        return res.status(200).json({
            message: "Profile details fetched successfully",
            admin: userDetails,
            employee: userDetails
        });
    } catch (error) {
        console.error("Error fetching profile details:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update User Profile Details
const updateAdmin = async (req, res) => {
    try {
        const EmployeeId = req.params.EmployeeId;
        if (!EmployeeId) return res.status(400).json({ message: "EmployeeId is required" });

        const employee = await Employee.findOne({ _id: EmployeeId });
        if (!employee) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateData = req.body;

        employee.firstname = updateData.firstname || updateData.adminfirstname || employee.firstname;
        employee.lastname = updateData.lastname || updateData.adminlastname || employee.lastname;
        employee.email = updateData.email || employee.email;
        employee.phone = updateData.phone !== undefined ? updateData.phone : employee.phone;
        employee.gender = updateData.gender || employee.gender;
        employee.updatedAt = new Date().toISOString();

        await employee.save();

        const updatedUser = employee.toObject();
        delete updatedUser.password;

        return res.status(200).json({
            message: "Profile details updated successfully",
            admin: updatedUser,
            employee: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile details:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Verify Old Password
const verifyOldPassword = async (req, res) => {
    try {
        const { oldPassword } = req.body;
        if (!oldPassword) return res.status(400).json({ message: "Old password is required" });

        const EmployeeId = req.params.EmployeeId;
        if (!EmployeeId) return res.status(400).json({ message: "EmployeeId is required" });

        const employee = await Employee.findOne({ _id: EmployeeId });
        if (!employee) return res.status(404).json({ message: "User not found" });

        const isPasswordMatch = await bcrypt.compare(oldPassword, employee.password);
        if (!isPasswordMatch) return res.status(401).json({ message: "Incorrect old password" });

        return res.status(200).json({ message: "Old password verified successfully" });
    } catch (error) {
        console.error("Error verifying old password:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) return res.status(400).json({ message: "New password is required" });

        const EmployeeId = req.params.EmployeeId;
        if (!EmployeeId) return res.status(400).json({ message: "EmployeeId is required" });

        const employee = await Employee.findOne({ _id: EmployeeId });
        if (!employee) return res.status(404).json({ message: "User not found" });

        employee.password = await bcrypt.hash(newPassword, 10);
        employee.updatedAt = new Date().toISOString();
        await employee.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get Login Activities
const getAdminLoginActivity = async (req, res) => {
    try {
        const { EmployeeId } = req.params;
        if (!EmployeeId) return res.status(400).json({ message: "EmployeeId is required" });

        const employee = await Employee.findOne({ _id: EmployeeId });
        if (!employee) return res.status(404).json({ message: "User not found" });

        const activities = await LoginActivity.find({ employeeid: employee.employeeid }).sort({ createdAt: -1 });
        const miscSettings = await MiscSetting.findOne();

        const dateFormat = miscSettings?.dateFormat || "DD/MM/YYYY";
        const timeFormat = miscSettings?.timeFormat || "hh:mm A";
        const timeZone = miscSettings?.timeZone || "Asia/Kolkata";

        const formattedActivities = activities.map((activity) => {
            const act = activity.toObject();
            const formattedLogin = act.login
                ? moment.tz(act.login, timeZone).format(`${dateFormat} ${timeFormat}`)
                : "";
            return {
                ...act,
                loginFormatted: formattedLogin
            };
        });

        return res.status(200).json({
            message: "Login activity fetched successfully",
            activities: formattedActivities,
            miscSettings: miscSettings ? {
                timeZone: miscSettings.timeZone,
                dateFormat: miscSettings.dateFormat,
                timeFormat: miscSettings.timeFormat
            } : null
        });
    } catch (error) {
        console.error("Error fetching login activity:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    verifyToken,
    login_admin,
    getAdminDetailsById,
    updateAdmin,
    verifyOldPassword,
    changePassword,
    getAdminLoginActivity
};

