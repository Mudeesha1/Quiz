const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Paper = sequelize.define(
	"papers",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		detail: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		image_url: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		pdf_url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		subjects_has_years_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "subjects_has_years",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
	
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: "papers",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = Paper;
