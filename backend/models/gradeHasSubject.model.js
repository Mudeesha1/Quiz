const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const GradeHasSubject = sequelize.define(
	"grade_has_subjects",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		grade_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "grade",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
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
	},
	{
		tableName: "grade_has_subjects",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = GradeHasSubject;
