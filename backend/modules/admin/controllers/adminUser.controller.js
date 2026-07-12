const bcrypt = require("bcrypt");
const { User, Grade, UserLevel, QuizAttempt, Quiz, UserBadge, Badge } = require("../../../models/associations");
const { Op } = require("sequelize");

const buildProfileUrl = (fullName) => {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const seed = encodeURIComponent(initials || fullName.trim().replace(/\s+/g, "").toUpperCase());
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&background=%23ffffff`;
};

/**
 * Get all users with grade and level details.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Grade,
          as: "grade",
          attributes: ["id", "grade_name"],
        },
        {
          model: UserLevel,
          as: "currentLevel",
          attributes: ["id", "level_name"],
        }
      ],
      order: [["joined_at", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      data: {
        users: users.map((user) => ({
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          school_name: user.school_name,
          joined_at: user.joined_at,
          profile_url: user.profile_url,
          status: user.status,
          grade: user.grade?.grade_name || "N/A",
          current_xp: user.current_xp,
          current_level: user.currentLevel?.level_name || "Level 1",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user by Admin.
 */
const createUser = async (req, res, next) => {
  try {
    const { fullname, username, email, password, school_name, grade } = req.body || {};

    if (!fullname || !username || !email || !password || !school_name || !grade) {
      return res.status(400).json({
        status: "fail",
        message: "Fullname, username, email, password, school_name, and grade are required",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: email.toLowerCase() }],
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "A user with that username or email already exists",
      });
    }

    const dbGrade = await Grade.findOne({ where: { grade_name: grade } });
    if (!dbGrade) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid grade selected",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let profileUrl = buildProfileUrl(fullname);
    if (req.file) {
      const UPLOAD_CONFIG = require("../../../config/upload.config");
      profileUrl = UPLOAD_CONFIG.getUrlPath("profiles", req.file.filename);
    }

    const user = await User.create({
      fullname: fullname.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      school_name: school_name.trim(),
      profile_url: profileUrl,
      grade_id: dbGrade.id,
      status: "Active",
    });

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user: {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          school_name: user.school_name,
          joined_at: user.joined_at,
          profile_url: user.profile_url,
          status: user.status,
          grade: dbGrade.grade_name,
          current_xp: 0,
          current_level: "Level 1",
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user record.
 */
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullname, email, school_name, status, grade } = req.body || {};

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (fullname !== undefined) user.fullname = fullname.trim();
    if (email !== undefined) user.email = email.trim();
    if (school_name !== undefined) user.school_name = school_name.trim();
    if (status !== undefined && ["Active", "Inactive"].includes(status)) {
      user.status = status;
    }

    if (grade) {
      const dbGrade = await Grade.findOne({ where: { grade_name: grade } });
      if (dbGrade) {
        user.grade_id = dbGrade.id;
      }
    }

    if (req.file) {
      const UPLOAD_CONFIG = require("../../../config/upload.config");
      user.profile_url = UPLOAD_CONFIG.getUrlPath("profiles", req.file.filename);
    }

    await user.save();

    // Reload user with associations
    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: Grade,
          as: "grade",
          attributes: ["id", "grade_name"],
        },
        {
          model: UserLevel,
          as: "currentLevel",
          attributes: ["id", "level_name"],
        }
      ]
    });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
        user: {
          id: updatedUser.id,
          fullname: updatedUser.fullname,
          username: updatedUser.username,
          email: updatedUser.email,
          school_name: updatedUser.school_name,
          joined_at: updatedUser.joined_at,
          profile_url: updatedUser.profile_url,
          status: updatedUser.status,
          grade: updatedUser.grade?.grade_name || "N/A",
          current_xp: updatedUser.current_xp,
          current_level: updatedUser.currentLevel?.level_name || "Level 1",
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user record.
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user performance data (quiz scores, earned badges, etc.) for admin review.
 */
const getUserPerformance = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Grade,
          as: "grade",
          attributes: ["id", "grade_name"],
        },
        {
          model: UserLevel,
          as: "currentLevel",
          attributes: ["id", "level_name"],
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Fetch quiz attempts with quiz details
    const quizAttempts = await QuizAttempt.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Quiz,
          as: "quiz",
          attributes: ["id", "quiz_name"],
        }
      ],
      order: [["completed_at", "DESC"]],
    });

    // Fetch earned badges
    const userBadges = await UserBadge.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Badge,
          as: "badge",
          attributes: ["id", "name", "description", "icon_url", "badge_type"],
        }
      ],
      order: [["earned_at", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          school_name: user.school_name,
          profile_url: user.profile_url,
          current_xp: user.current_xp,
          grade: user.grade?.grade_name || "N/A",
          level: user.currentLevel?.level_name || "Starter",
        },
        quizAttempts: quizAttempts.map(attempt => ({
          id: attempt.id,
          quiz_name: attempt.quiz?.quiz_name || "Unknown Quiz",
          score: attempt.score,
          xp_gained: attempt.xp_gained,
          is_completed: attempt.is_completed,
          completed_at: attempt.completed_at,
          started_at: attempt.started_at,
        })),
        badges: userBadges.map(ub => ({
          id: ub.badge?.id,
          name: ub.badge?.name || "Unknown Badge",
          description: ub.badge?.description || "",
          icon_url: ub.badge?.icon_url,
          badge_type: ub.badge?.badge_type,
          earned_at: ub.earned_at,
        })),
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserPerformance,
};
