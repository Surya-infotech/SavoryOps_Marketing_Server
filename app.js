require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/db");
const adminRouter = require("./router/admin-router");
const systemrouteradmin = require("./router/AdminPanel/system-router");
const userrouteradmin = require("./router/AdminPanel/user-router");
const mainrouteradmin = require("./router/AdminPanel/main-router");
const app = express();

const corsOptions = {
    origin: (origin, callback) => {
       const allowedOrigins = [
            "https://savoryops.com",
            "https://www.savoryops.com",
            "https://sunarise.savoryops.com",
            "http://localhost:5172",
            "http://localhost:5171"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-user", "X-User"],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health Check / Status Route
app.get("/Status", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "SavoryOps Marketing backend server is running!",
        timestamp: new Date().toISOString()
    });
});

app.use("/admin", adminRouter);
app.use("/Main", mainrouteradmin);
app.use("/System", systemrouteradmin);
app.use("/User", userrouteradmin);

const PORT = process.env.PORT || 8084;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(` SavoryOps Marketing Server running on port ${PORT}`);
        console.log(` Health Check: http://localhost:${PORT}/Status`);
    });
}).catch((err) => {
    console.error("Failed to start server:", err);
});

module.exports = app;

