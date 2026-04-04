import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../models/constants.js";

export type AuthUser = {
    id: number;
    name: string;
    role: (typeof USER_ROLES)[number];
};

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
            return res.status(401).send({
                status: 401,
                message: "Authorization token is required",
            });
        }

        const token = authorizationHeader.slice(7).trim();
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).send({
                status: 500,
                message: "JWT_SECRET is not configured",
            });
        }

        const decoded = jwt.verify(token, jwtSecret) as {
            userId: number;
            name: string;
            role: (typeof USER_ROLES)[number];
        };

        req.user = {
            id: decoded.userId,
            name: decoded.name,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).send({
            status: 401,
            message: error instanceof Error ? error.message : "Invalid or expired token",
        });
    }
};

export default auth;
