const Grade = require("../../../models/grade.model");
const Subject = require("../../../models/subject.model");
const GradeHasSubject = require("../../../models/gradeHasSubject.model");
const User = require("../../../models/users.model");
const UserLevel = require("../../../models/userLevel.model");

const getGrades = async (req, res, next) => {
  try {
    const grades = await Grade.findAll({ order: [["id", "ASC"]] });
    return res.status(200).json({ status: "success", data: grades });
  } catch (error) {
    next(error);
  }
};

const getSubjectsByGrade = async (req, res, next) => {
  try {
    const { gradeId } = req.params;

    if (!gradeId) {
      return res.status(400).json({
        status: "fail",
        message: "Grade ID is required",
      });
    }

    // Get all subjects for the specified grade using many-to-many relationship
    const subjects = await Subject.findAll({
      include: [
        {
          model: Grade,
          as: "grades",
          where: { id: gradeId },
          attributes: [],
          through: { attributes: [] },
          required: true,
        },
      ],
      order: [["subject_name", "ASC"]],
    });

    return res.status(200).json({
      status: "success",
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

const getTopRankedUsers = async (req, res, next) => {
  try {
    // Get top 3 users by XP with their level info
    const topUsers = await User.findAll({
      include: [
        {
          model: UserLevel,
          as: "currentLevel",
          attributes: ["id", "level_no", "level_name"],
        },
      ],
      attributes: ["id", "fullname", "current_xp", "profile_url"],
      order: [["current_xp", "DESC"]],
      limit: 3,
    });

    // Map to include rank
    const rankedUsers = topUsers.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      fullname: user.fullname,
      current_xp: user.current_xp,
      profile_url: user.profile_url,
      level: user.currentLevel,
    }));

    return res.status(200).json({
      status: "success",
      data: rankedUsers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGrades,
  getSubjectsByGrade,
  getTopRankedUsers,
};
