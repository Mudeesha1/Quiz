const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserLevel = sequelize.define(
	"user_levels",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		level_no: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		level_name: {
			type: DataTypes.STRING(45),
			allowNull: false,
		},
		xp_required: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	},
	{
		tableName: "user_levels",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = UserLevel;
