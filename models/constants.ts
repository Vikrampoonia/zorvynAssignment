import "dotenv/config";
import { Sequelize } from "sequelize";

export const USER_ROLES = ["admin", "analyst", "viewer"] as const;
export const USER_STATUSES = ["active", "inactive"] as const;
export const RECORD_TYPES = ["expense", "income"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type RecordType = (typeof RECORD_TYPES)[number];

export const sequelize = new Sequelize(process.env.DATABASE_URL ?? "", {
    dialect: "postgres",
    logging: false,
});

export const connectDb = async () => {
    await sequelize.authenticate();
};
class Constants {
    httpStatus: {
        success: number;
        created: number;
        accepted: number;
        unauthorized: number;
        forbidden: number;
        serverError: number;
        noContent: number;
        notFound: number;
        badRequest: number;
        conflict: number;
        notAllowed: number;
        serviceUnavailable: number;
        modified: number;
    };

    constructor () {

        this.httpStatus = {
            success: 200,
            created: 201,
            accepted: 202,
            unauthorized: 401,
            forbidden: 403,
            serverError: 500,
            noContent: 204,
            notFound: 404,
            badRequest: 400,
            conflict: 409,
            notAllowed: 405,
            serviceUnavailable: 503,
            modified: 302,
        };
    }
};
 
export default new Constants();