import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { sequelize } from "./constants.js";

export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
    declare id: CreationOptional<number>;
    declare userId: number;
    declare jti: string;
    declare token: string;
    declare expiresAt: Date;
    declare revokedAt: CreationOptional<Date | null>;
    declare replacedByJti: CreationOptional<string | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RefreshToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        jti: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        revokedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        replacedByJti: {
            type: DataTypes.STRING(64),
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
        modelName: "RefreshToken",
        tableName: "refresh_tokens",
        timestamps: true,
    }
);

export default RefreshToken;