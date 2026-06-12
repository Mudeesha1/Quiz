const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const UserReview = sequelize.define(
	"user_reviews",
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
		scholarship_marks: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		review_rating: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 5,
		},
		review_text: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "user_reviews",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = UserReview;
