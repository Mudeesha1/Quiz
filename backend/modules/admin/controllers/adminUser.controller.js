const bcrypt = require("bcrypt");
const { User, Grade, UserLevel, QuizAttempt, Quiz, UserBadge, Badge, Paper } = require("../../../models/associations");
const { Op } = require("sequelize");
const sequelize = require("../../../config/db.config");

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

/**
 * Get dashboard metrics, trends, activities, and tables for admin overview.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total counts
    const totalStudents = await User.count();
    const totalQuizzes = await Quiz.count();
    const totalPapers = await Paper.count();

    // 2. Grade distribution
    const grades = await Grade.findAll({
      attributes: ["id", "grade_name"],
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id"],
        }
      ]
    });
    const gradeDistribution = grades.map(g => ({
      grade: g.grade_name,
      count: g.users?.length || 0,
    }));

    // 3. Quiz attempts performance range (0-49, 50-74, 75-100)
    const attempts = await QuizAttempt.findAll({
      attributes: ["score"],
    });
    let rangeLow = 0;   // 0-49
    let rangeMedium = 0; // 50-74
    let rangeHigh = 0;  // 75-100
    attempts.forEach(a => {
      if (a.score !== null) {
        if (a.score < 50) rangeLow++;
        else if (a.score < 75) rangeMedium++;
        else rangeHigh++;
      }
    });
    const performanceRanges = [
      { name: "Under 50%", count: rangeLow, color: "#f43f5e" },
      { name: "50% - 74%", count: rangeMedium, color: "#f59e0b" },
      { name: "75% & Above", count: rangeHigh, color: "#10b981" },
    ];

    // 4. Monthly Registrations (Last 6 Months)
    const allUsers = await User.findAll({
      attributes: ["joined_at"],
      order: [["joined_at", "ASC"]],
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const registrationCounts = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      registrationCounts[key] = 0;
    }

    allUsers.forEach(u => {
      if (u.joined_at) {
        const d = new Date(u.joined_at);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (registrationCounts[key] !== undefined) {
          registrationCounts[key]++;
        }
      }
    });

    const monthlyRegistrations = Object.entries(registrationCounts).map(([month, count]) => ({
      month,
      count,
    }));

    // 5. Popular Quizzes (Top 5 by attempt count)
    const quizStats = await QuizAttempt.findAll({
      attributes: [
        "quiz_id",
        [sequelize.fn("COUNT", sequelize.col("quiz_attempts.id")), "attemptCount"]
      ],
      group: ["quiz_id"],
      include: [
        {
          model: Quiz,
          as: "quiz",
          attributes: ["quiz_name"],
        }
      ],
      order: [[sequelize.literal("attemptCount"), "DESC"]],
      limit: 5,
    });

    const popularQuizzes = quizStats.map(qs => ({
      quiz_name: qs.quiz?.quiz_name || "Unknown Quiz",
      attempts: parseInt(qs.dataValues.attemptCount) || 0,
    }));

    // 6. Recent student activity
    const recentAttempts = await QuizAttempt.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["fullname"],
          include: [
            {
              model: Grade,
              as: "grade",
              attributes: ["grade_name"],
            }
          ]
        },
        {
          model: Quiz,
          as: "quiz",
          attributes: ["quiz_name"],
        }
      ],
      order: [["started_at", "DESC"]],
      limit: 30,
    });

    const recentActivity = recentAttempts.map(ra => ({
      id: ra.id,
      name: ra.user?.fullname || "Anonymous",
      grade: ra.user?.grade?.grade_name || "N/A",
      quiz: ra.quiz?.quiz_name || "Unknown Quiz",
      score: ra.score !== null ? `${Math.round(ra.score)}%` : "N/A",
      date: ra.completed_at || ra.started_at,
    }));

    // 7. Top Performing Students (Top 5 by XP)
    const topUsers = await User.findAll({
      attributes: ["id", "fullname", "school_name", "current_xp"],
      include: [
        {
          model: UserLevel,
          as: "currentLevel",
          attributes: ["level_name"],
        },
        {
          model: Grade,
          as: "grade",
          attributes: ["grade_name"],
        }
      ],
      order: [["current_xp", "DESC"]],
      limit: 5,
    });

    const topPerformers = topUsers.map(tu => ({
      id: tu.id,
      fullname: tu.fullname,
      school_name: tu.school_name || "N/A",
      xp: tu.current_xp,
      level: tu.currentLevel?.level_name || "Starter",
      grade: tu.grade?.grade_name || "N/A",
    }));

    // 8. Quiz Attempts Trend (Last 6 Months)
    const allAttempts = await QuizAttempt.findAll({
      attributes: ["started_at", "completed_at"],
    });
    const attemptsCounts = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      attemptsCounts[key] = 0;
    }
    allAttempts.forEach(a => {
      const dateVal = a.completed_at || a.started_at;
      if (dateVal) {
        const d = new Date(dateVal);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (attemptsCounts[key] !== undefined) {
          attemptsCounts[key]++;
        }
      }
    });
    const attemptsTrend = Object.entries(attemptsCounts).map(([month, count]) => ({
      month,
      count,
    }));

    // 9. User Account Status Split
    const activeAccounts = await User.count({ where: { status: "Active" } });
    const inactiveAccounts = await User.count({ where: { status: "Inactive" } });
    const accountStatus = {
      active: activeAccounts,
      inactive: inactiveAccounts,
    };

    return res.status(200).json({
      status: "success",
      data: {
        totalStudents,
        totalQuizzes,
        totalPapers,
        gradeDistribution,
        performanceRanges,
        monthlyRegistrations,
        popularQuizzes,
        recentActivity,
        topPerformers,
        attemptsTrend,
        accountStatus,
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
  getDashboardStats,
};
