const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const SubjectHasYear = sequelize.define(
	"subjects_has_years",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		subjects_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "subjects",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		years_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "years",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
	},
	{
		tableName: "subjects_has_years",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = SubjectHasYear;
