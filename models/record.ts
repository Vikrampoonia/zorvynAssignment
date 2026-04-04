import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { RECORD_TYPES, sequelize } from "./constants.js";
import { User } from "./user.js";

export class RecordModel extends Model<InferAttributes<RecordModel>, InferCreationAttributes<RecordModel>> {
    declare id: CreationOptional<number>;
    declare userId: number;
    declare amount: string;
    declare type: (typeof RECORD_TYPES)[number];
    declare category: string;
    declare date: Date;
    declare notes: CreationOptional<string | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RecordModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM(...RECORD_TYPES),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
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
        modelName: "Record",
        tableName: "records",
        timestamps: true,
    }
);

User.hasMany(RecordModel, { foreignKey: "userId", as: "records" });
RecordModel.belongsTo(User, { foreignKey: "userId", as: "user" });
