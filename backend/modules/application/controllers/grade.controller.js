const Grade = require("../../../models/grade.model");

const getGrades = async (req, res, next) => {
  try {
    const grades = await Grade.findAll({ order: [["id", "ASC"]] });
    return res.status(200).json({ status: "success", data: grades });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGrades,
};
