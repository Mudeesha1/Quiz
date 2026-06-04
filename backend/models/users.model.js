const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const User = sequelize.define(
	"users",
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		fullname: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING(45),
			allowNull: false,
			unique: true,
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		school_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		joined_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		vcode: {
			type: DataTypes.STRING(6),
			allowNull: true,
            defaultValue:"000000",
		},
		profile_url: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		grade_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "grade",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "RESTRICT",
		},
	},
	{
		tableName: "users",
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = User;
