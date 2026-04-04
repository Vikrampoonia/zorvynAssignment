import rateLimit from "express-rate-limit";
import constants from "../models/constants.js";

const tooManyRequestsMessage = {
    status: 429,
    message: "Too many requests, please try again later.",
};

const createLimiter = (max: number, windowMs: number = constants.rateLimit.windowMs) => rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: tooManyRequestsMessage,
});

export const globalRateLimiter = createLimiter(constants.rateLimit.global);

export const authRateLimiters = {
    login: createLimiter(constants.rateLimit.auth.login),
    sendOtp: createLimiter(constants.rateLimit.auth.sendOtp),
    verifyOtp: createLimiter(constants.rateLimit.auth.verifyOtp),
    refreshToken: createLimiter(constants.rateLimit.auth.refreshToken),
    logout: createLimiter(constants.rateLimit.auth.logout),
};

export const userRateLimiters = {
    createUser: createLimiter(constants.rateLimit.user.createUser),
    updateUser: createLimiter(constants.rateLimit.user.updateUser),
    deleteUser: createLimiter(constants.rateLimit.user.deleteUser),
    getUser: createLimiter(constants.rateLimit.user.getUser),
};

export const recordRateLimiters = {
    createRecord: createLimiter(constants.rateLimit.record.createRecord),
    updateRecord: createLimiter(constants.rateLimit.record.updateRecord),
    deleteRecord: createLimiter(constants.rateLimit.record.deleteRecord),
    getRecord: createLimiter(constants.rateLimit.record.getRecord),
    getDashboardSummary: createLimiter(constants.rateLimit.record.getDashboardSummary),
};