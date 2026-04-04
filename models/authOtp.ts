import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { sequelize } from "./constants.js";

export class AuthOtp extends Model<InferAttributes<AuthOtp>, InferCreationAttributes<AuthOtp>> {
    declare id: CreationOptional<number>;
    declare phoneNumber: string;
    declare otp: string;
    declare verified: CreationOptional<boolean>;
    declare expiresAt: Date;
    declare usedAt: CreationOptional<Date | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

AuthOtp.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        phoneNumber: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        otp: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        usedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "AuthOtp",
        tableName: "auth_otps",
        timestamps: true,
    }
);

export default AuthOtp;