const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Admin = sequelize.define(
	"admins",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		admin_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING(45),
			allowNull: false,
			unique: true,
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		joined_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		profile_url: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	},
	{
		tableName: "admins",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Admin;
