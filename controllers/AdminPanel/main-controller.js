const Employee = require("../../models/AdminPanel/User/employee-model");
const FiscalYear = require("../../models/AdminPanel/System/Setting/fiscalyear-model");
const MiscSetting = require("../../models/AdminPanel/System/Setting/miscsetting-model");
const WhiteLabel = require("../../models/AdminPanel/Support/whitelabel-model");
const ContactUs = require("../../models/AdminPanel/Support/contactus-model");
const Subscriber = require("../../models/AdminPanel/Support/subscriber-model");
const moment = require("moment-timezone");

const get_dashboard = async (req, res) => {
    try {
        const { fiscalYearId } = req.params;

        // Fetch misc setting for timezone & date formatting
        const miscSetting = await MiscSetting.findOne().lean();
        const timeZone = miscSetting?.timeZone || "Asia/Kolkata";
        const dateFormat = miscSetting?.dateFormat || "DD/MM/YYYY";
        const timeFormat = miscSetting?.timeFormat || "hh:mm A";

        const formatDateOnly = (dateStr) => {
            if (!dateStr) return "-";
            try {
                const m = moment.tz(dateStr, timeZone);
                return m.isValid() ? m.format(dateFormat) : String(dateStr);
            } catch {
                return String(dateStr);
            }
        };

        const formatDateTime = (dateStr) => {
            if (!dateStr) return "-";
            try {
                const m = moment.tz(dateStr, timeZone);
                return m.isValid() ? m.format(`${dateFormat} ${timeFormat}`) : String(dateStr);
            } catch {
                return String(dateStr);
            }
        };

        // Determine date range from Fiscal Year if provided
        let dateQuery = {};
        if (fiscalYearId && fiscalYearId !== "default") {
            const fy = await FiscalYear.findOne({
                $or: [
                    { fiscalyearid: isNaN(Number(fiscalYearId)) ? -1 : Number(fiscalYearId) },
                    { fiscalyear: fiscalYearId }
                ]
            }).lean();

            if (fy && fy.startdate && fy.enddate) {
                dateQuery = {
                    createdAt: {
                        $gte: fy.startdate,
                        $lte: fy.enddate.length === 10 ? `${fy.enddate}T23:59:59.999Z` : fy.enddate
                    }
                };
            }
        }

        // Aggregate core counts
        const totalEmployeesCount = await Employee.countDocuments();
        const activeEmployeesCount = await Employee.countDocuments({ status: true });
        const whiteLabelCount = await WhiteLabel.countDocuments();
        const contactUsCount = await ContactUs.countDocuments();
        const totalSubscriptionCount = await Subscriber.countDocuments();

        // White-label status breakdown
        const whiteLabelStatusCounts = {
            Pending: await WhiteLabel.countDocuments({ status: "Pending" }),
            Contacted: await WhiteLabel.countDocuments({ status: "Contacted" }),
            "In Progress": await WhiteLabel.countDocuments({ status: "In Progress" }),
            Closed: await WhiteLabel.countDocuments({ status: "Closed" })
        };

        // Recent 5 White-Label Inquiries
        const rawWhiteLabels = await WhiteLabel.find().sort({ createdAt: -1 }).limit(5).lean();
        const recentWhiteLabels = rawWhiteLabels.map(item => ({
            ...item,
            formattedDate: formatDateOnly(item.createdAt),
            formattedDateTime: formatDateTime(item.createdAt)
        }));

        // Recent 5 Employees
        const rawEmployees = await Employee.find().select("-password").sort({ createdAt: -1 }).limit(5).lean();
        const recentEmployees = rawEmployees.map(emp => ({
            ...emp,
            fullname: `${emp.firstname || ""} ${emp.lastname || ""}`.trim() || emp.email,
            formattedDate: formatDateOnly(emp.createdAt),
            formattedDateTime: formatDateTime(emp.createdAt)
        }));

        // Monthly Summary (Jan to Dec, _id: 1 to 12)
        const monthlySummary = Array.from({ length: 12 }, (_, i) => ({
            _id: i + 1,
            whiteLabelCount: 0,
            contactUsCount: 0,
            totalInquiries: 0,
            subscriberCount: 0,
            orderCount: 0,
            monthlyRevenue: 0
        }));

        const allWhiteLabels = await WhiteLabel.find(dateQuery).select("createdAt").lean();
        allWhiteLabels.forEach(doc => {
            if (doc.createdAt) {
                const m = moment.tz(doc.createdAt, timeZone);
                if (m.isValid()) {
                    const monthIdx = m.month();
                    if (monthIdx >= 0 && monthIdx < 12) {
                        monthlySummary[monthIdx].whiteLabelCount += 1;
                        monthlySummary[monthIdx].totalInquiries += 1;
                        monthlySummary[monthIdx].orderCount += 1;
                    }
                }
            }
        });

        const allContactUs = await ContactUs.find(dateQuery).select("createdAt").lean();
        allContactUs.forEach(doc => {
            if (doc.createdAt) {
                const m = moment.tz(doc.createdAt, timeZone);
                if (m.isValid()) {
                    const monthIdx = m.month();
                    if (monthIdx >= 0 && monthIdx < 12) {
                        monthlySummary[monthIdx].contactUsCount += 1;
                        monthlySummary[monthIdx].totalInquiries += 1;
                    }
                }
            }
        });

        const allSubscribers = await Subscriber.find(dateQuery).select("createdAt").lean();
        allSubscribers.forEach(doc => {
            if (doc.createdAt) {
                const m = moment.tz(doc.createdAt, timeZone);
                if (m.isValid()) {
                    const monthIdx = m.month();
                    if (monthIdx >= 0 && monthIdx < 12) {
                        monthlySummary[monthIdx].subscriberCount += 1;
                    }
                }
            }
        });

        const currencyDetails = {
            currency: "USD",
            currencysymbol: "$",
            currencyposition: "left",
            thousandseparator: ",",
            decimalseparator: ".",
            decimal: 2,
            ...(miscSetting || {})
        };

        return res.status(200).json({
            message: "Dashboard data fetched successfully",
            whiteLabelCount,
            contactUsCount,
            totalSubscriptionCount,
            totalEmployeesCount,
            activeEmployeesCount,
            whiteLabelStatusCounts,
            recentWhiteLabels,
            recentEmployees,
            monthlySummary,
            currencyDetails,
            // Compatibility aliases for existing UI hooks
            totalCustomersCount: totalEmployeesCount,
            totalOrdersCount: whiteLabelCount,
            allOrdersCount: whiteLabelCount + contactUsCount,
            totalRevenue: 0,
            recentOrders: recentWhiteLabels,
            recentCustomers: recentEmployees,
            kpiDifferences: {
                whiteLabelDifference: "+100%",
                contactUsDifference: "+100%",
                subscribersDifference: "+12%",
                employeesDifference: "0%",
                ordersDifference: "+100%",
                revenueDifference: "0%",
                customersDifference: "0"
            }
        });
    } catch (error) {
        console.error("Error in get_dashboard controller:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    get_dashboard
};