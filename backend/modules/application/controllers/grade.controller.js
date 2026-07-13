const { Grade, Subject, GradeHasSubject, User, UserLevel, Quiz, QuizAttempt } = require("../../../models/associations");

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

const getLeaderboard = async (req, res, next) => {
  try {
    const { subject } = req.query; // e.g. "Mathematics", "All Subjects", or undefined
    const userId = req.userId;

    // Fetch all user levels mapping for fast levels lookup
    const allUsers = await User.findAll({
      include: [
        {
          model: UserLevel,
          as: "currentLevel",
          attributes: ["level_no", "level_name"],
        },
      ],
      attributes: ["id", "fullname", "current_xp", "profile_url"],
    });

    let rankedList = [];

    if (!subject || subject === "All Subjects") {
      // Global ranking: sort users by current_xp DESC
      rankedList = allUsers.map((user) => ({
        id: user.id,
        name: user.fullname,
        xp: user.current_xp,
        level: user.currentLevel?.level_no || 1,
        badge: user.currentLevel?.level_name || "Starter",
        trend: "Hold",
        profile_url: user.profile_url,
      }));

      rankedList.sort((a, b) => b.xp - a.xp);
    } else {
      // Subject-specific ranking:
      // We need to sum the quiz_attempts.xp_gained for each user where the quiz belongs to the target subject.
      const attempts = await QuizAttempt.findAll({
        include: [
          {
            model: Quiz,
            as: "quiz",
            required: true,
            include: [
              {
                model: GradeHasSubject,
                as: "gradeHasSubject",
                required: true,
                include: [
                  {
                    model: Subject,
                    as: "subject",
                    where: { subject_name: subject },
                    required: true,
                  },
                ],
              },
            ],
          },
        ],
        attributes: ["user_id", "xp_gained"],
      });

      // Group by user_id and sum xp_gained
      const userXpMap = {};
      attempts.forEach((att) => {
        userXpMap[att.user_id] = (userXpMap[att.user_id] || 0) + (att.xp_gained || 0);
      });

      rankedList = allUsers.map((user) => {
        const subjectXp = userXpMap[user.id] || 0;
        return {
          id: user.id,
          name: user.fullname,
          xp: subjectXp,
          level: user.currentLevel?.level_no || 1,
          badge: user.currentLevel?.level_name || "Starter",
          trend: "Hold",
          profile_url: user.profile_url,
        };
      });

      rankedList.sort((a, b) => b.xp - a.xp);
    }

  // Assign rank positions
    const finalizedList = rankedList.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return res.status(200).json({
      status: "success",
      data: finalizedList,
    });
  } catch (error) {
    next(error);
  }
};

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({ order: [["subject_name", "ASC"]] });
    return res.status(200).json({ status: "success", data: subjects });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGrades,
  getSubjectsByGrade,
  getTopRankedUsers,
  getLeaderboard,
  getSubjects,
};
