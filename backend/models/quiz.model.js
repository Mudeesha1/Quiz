const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Quiz = sequelize.define(
	"quizzes",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		quiz_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		grade_has_subjects_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "grade_has_subjects",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "RESTRICT",
		},
		time_limit: {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: "Time limit in seconds",
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "quizzes",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Quiz;
