import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";

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
        message: "Zorvyn Finance API Server is running!" 
    });
});

// --- 4. SERVER STARTUP ---

const startServer = async () => {
    const PORT = process.env.PORT || 8080; 
    
    app.listen(PORT, () => {
        console.log(`🚀 Server successfully started on port ${PORT}`);
        console.log(`👉 Test the root: http://localhost:${PORT}/`);
        console.log(`👉 Test the API:  http://localhost:${PORT}/api/temp`);
    });
};

startServer();

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});