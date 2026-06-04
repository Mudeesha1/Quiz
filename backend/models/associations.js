const Grade = require("./grade.model");
const User = require("./users.model");

Grade.hasMany(User, {
  foreignKey: "grade_id",
  as: "users",
});

User.belongsTo(Grade, {
  foreignKey: "grade_id",
  as: "grade",
});

module.exports = {
  Grade,
  User,
};