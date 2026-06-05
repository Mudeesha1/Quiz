const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Badge = sequelize.define(
	"badges",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		icon_url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		xp_required: {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: "XP required to unlock this badge",
		},
		badge_type: {
			type: DataTypes.ENUM("achievement", "milestone", "streak", "special"),
			allowNull: false,
			defaultValue: "achievement",
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "badges",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Badge;
