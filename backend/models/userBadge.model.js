const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserBadge = sequelize.define(
	"user_badges",
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
		badge_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "badges",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		earned_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "user_badges",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = UserBadge;
