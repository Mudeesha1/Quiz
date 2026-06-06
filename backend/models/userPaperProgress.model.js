const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserPaperProgress = sequelize.define(
	"user_paper_progress",
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
		paper_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "papers",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		is_completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		downloaded_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		completed_at: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		tableName: "user_paper_progress",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = UserPaperProgress;
