const Employee = require("../../models/AdminPanel/User/employee-model");
const FiscalYear = require("../../models/AdminPanel/System/Setting/fiscalyear-model");
const MiscSetting = require("../../models/AdminPanel/System/Setting/miscsetting-model");

const get_dashboard = async (req, res) => {
    try {
        const { fiscalYearId } = req.params;

        const totalEmployeesCount = await Employee.countDocuments();
        const activeEmployeesCount = await Employee.countDocuments({ status: true });

        // Clean monthly summary with zeroed metrics
        const monthlySummary = Array.from({ length: 12 }, (_, i) => ({
            _id: i + 1,
            monthlyRevenue: 0,
            orderCount: 0,
            subscriptionCount: 0
        }));

        const orderStatusCounts = {
            Pending: 0,
            Confirmed: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        const miscSetting = await MiscSetting.findOne().lean();
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
            totalOrdersCount: 0,
            allOrdersCount: 0,
            totalRevenue: 0,
            totalSubtotalSum: 0,
            totalTaxSum: 0,
            totalProductsCount: 0,
            publishedProductsCount: 0,
            totalCustomersCount: 0,
            monthlySummary,
            orderStatusCounts,
            recentOrders: [],
            recentCustomers: [],
            recentProducts: [],
            currencyDetails,
            kpiDifferences: {
                ordersDifference: "0%",
                revenueDifference: "0%",
                productsDifference: "0",
                customersDifference: "0"
            },
            totalOwnerCount: totalEmployeesCount,
            totalPriceSum: 0,
            activeSubscriptionCount: 0,
            totalSubscriptionCount: 0
        });
    } catch (error) {
        console.error("Error in get_dashboard controller:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    get_dashboard
};
