import express from "express";
import type { Request, Response } from "express";
import authController from "../controllers/authController.js";
import auth from "../middlewares/auth.js";
import type { AuthLoginRequest, AuthLogoutRequest, AuthRefreshTokenRequest, AuthSendOtpRequest, AuthVerifyOtpRequest } from "../types/authTypes.js";
const router = express.Router();

router.post("/login", async function (req: Request<{}, unknown, unknown, AuthLoginRequest>, res: Response) {
    const { phoneNumber, otp } = req.query;
    const data = await authController.login({ phoneNumber, otp });
    res.status(data.status).send(data);
});

router.post("/send-otp", async function (req: Request<{}, unknown, unknown, AuthSendOtpRequest>, res: Response) {
    const { phoneNumber } = req.query;
    const data = await authController.sendOtp({ phoneNumber });
    res.status(data.status).send(data);
});

router.post("/verify-otp", async function (req: Request<{}, unknown, unknown, AuthVerifyOtpRequest>, res: Response) {
    const { phoneNumber, otp } = req.query;
    const data = await authController.verifyOtp({ phoneNumber, otp });
    res.status(data.status).send(data);
});

router.post("/refresh-token", async function (req: Request<{}, unknown, unknown, Partial<AuthRefreshTokenRequest>>, res: Response) {
    const requestPayload = {
        ...(req.query as Partial<AuthRefreshTokenRequest>),
        ...(req.body as Partial<AuthRefreshTokenRequest>),
    };
    const { refreshToken } = requestPayload;
    const data = await authController.refreshToken({ refreshToken });
    res.status(data.status).send(data);
});

router.post("/logout", auth, async function (req: Request, res: Response) {
    const data = await authController.logout({ userId: req.user?.id });
    res.status(data.status).send(data);
});

export default router;