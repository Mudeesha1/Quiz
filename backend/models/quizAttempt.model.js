const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const QuizAttempt = sequelize.define(
	"quiz_attempts",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		quiz_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "quizzes",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		score: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		total_questions: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		correct_answers: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		xp_gained: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		is_completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		started_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		completed_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		tableName: "quiz_attempts",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = QuizAttempt;
