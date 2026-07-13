const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Question = sequelize.define(
	"questions",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
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
		question_text: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		image_url: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		question_order: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		hint: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "questions",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Question;
