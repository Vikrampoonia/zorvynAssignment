import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./models/constants.js";
import messages from "./models/messages.js";
import "./models/user.js";
import "./models/authOtp.js";
import "./models/refreshToken.js";
import "./models/record.js";
import userRouter from "./routers/userRouter.js";
import recordRouter from "./routers/recordRouter.js";
import authRouter from "./routers/authRouter.js";
import authService from "./services/authService.js";
import { globalRateLimiter } from "./middlewares/rateLimit.js";

dotenv.config();

const app = express();
const api = express(); // This acts as your main API router

// 1. Global Middleware
app.use(
    cors({
        origin: "*",
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
);

// Modern Express built-in body parsing 
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Global request throttling
app.use(globalRateLimiter);

// 2. API Routing & Logging Middleware
app.use(
    "/api",
    async (req: Request, res: Response, next: NextFunction) => {
        // Logs every request hitting the /api routes
        console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.originalUrl}`);
        next();
    },
    api
);

// --- 3. ROUTES ---

// Root health check route
app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: messages.system.serverRunning
    });
});

app.use("/user", userRouter);
app.use("/record", recordRouter);
app.use("/auth", authRouter);


// --- 4. SERVER STARTUP ---

const startServer = async () => {
    const PORT = process.env.PORT || 8080;

    await sequelize.authenticate();
    try {
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.warn("Sequelize alter sync failed, falling back to plain sync.", error);
        await sequelize.sync();
    }

    app.listen(PORT, () => {
        console.log(`🚀 Server successfully started on port ${PORT}`);
        console.log(`${messages.system.rootRouteHint}${PORT}/`);
        console.log(`${messages.system.apiRouteHint} ${PORT}/api`);
    });

    const cleanupAuthData = async () => {
        try {
            const result = await authService.cleanupExpiredAuthData();
            console.log(`${messages.system.authCleanupDeletedRows} ${result.expiredOtpsDeleted} OTP rows and ${result.refreshTokensDeleted} refresh-token rows`);
        } catch (error) {
            console.error(messages.system.authCleanupFailed, error);
        }
    };

    await cleanupAuthData();
    setInterval(() => {  //we replace this logic by schedular cron once it depolyed
        void cleanupAuthData();
    }, 24 * 60 * 60 * 1000);
};

startServer();

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});