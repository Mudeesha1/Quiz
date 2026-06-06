const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Subject = sequelize.define(
	"subjects",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		subject_name: {
			type: DataTypes.STRING(45),
			allowNull: false,
		},
	},
	{
		tableName: "subjects",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Subject;
