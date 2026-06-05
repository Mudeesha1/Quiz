const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Year = sequelize.define(
	"years",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		years_name: {
			type: DataTypes.STRING(4),
			allowNull: false,
		},
	},
	{
		tableName: "years",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Year;
