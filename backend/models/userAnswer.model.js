const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserAnswer = sequelize.define(
	"user_answers",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		quiz_attempt_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "quiz_attempts",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		question_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "questions",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		selected_option_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "question_options",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		is_correct: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		xp_gained: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		answered_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "user_answers",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = UserAnswer;
