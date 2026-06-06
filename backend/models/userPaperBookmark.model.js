const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserPaperBookmark = sequelize.define(
	"user_paper_bookmarks",
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
		bookmarked_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "user_paper_bookmarks",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = UserPaperBookmark;
