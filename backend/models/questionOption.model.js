const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const QuestionOption = sequelize.define(
	"question_options",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
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
		option_text: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		is_correct: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		option_order: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: "question_options",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = QuestionOption;
