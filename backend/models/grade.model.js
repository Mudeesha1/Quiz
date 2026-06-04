const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Grade = sequelize.define(
	"grade",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		grade_name: {
			type: DataTypes.STRING(10),
			allowNull: false,
		},
	},
	{
		tableName: "grade",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Grade;
