import type { NextFunction, Request, Response } from "express";
import type { AuthUser } from "./auth.js";
import { USER_ROLES } from "../models/constants.js";

type AllowedRole = (typeof USER_ROLES)[number];

const authorize = (...allowedRoles: AllowedRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as AuthUser | undefined;

        if (!user) {
            return res.status(401).send({
                status: 401,
                message: "Unauthorized",
            });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).send({
                status: 403,
                message: "Forbidden",
            });
        }

        next();
    };
};

export default authorize;
