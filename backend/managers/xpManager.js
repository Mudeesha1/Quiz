const {
  User,
  UserLevel,
  QuizAttempt,
  UserAnswer,
} = require("../models/associations");

/**
 * Calculate XP for a quiz attempt
 * @param {Number} totalQuestions - Total number of questions in quiz
 * @param {Number} correctAnswers - Number of correct answers
 * @returns {Number} Total XP earned (2 XP per correct answer)
 */
const calculateQuizXP = (totalQuestions, correctAnswers) => {
  return correctAnswers * 2;
};

/**
 * Update user XP and level based on quiz attempt
 * @param {Number} userId - User ID
 * @param {Number} xpGained - XP gained from quiz
 * @returns {Object} Updated user data with new XP and level
 */
const updateUserXPAndLevel = async (userId, xpGained) => {
  try {
    // Get current user
    const user = await User.findByPk(userId, {
      include: [{ model: UserLevel, as: "currentLevel" }],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Update current XP
    user.current_xp += xpGained;
    await user.save();

    // Check if user should level up
    const updatedUser = await checkAndUpdateLevel(user);

    return {
      userId: updatedUser.id,
      currentXP: updatedUser.current_xp,
      currentLevel: updatedUser.currentLevel,
      xpGained: xpGained,
      leveledUp: updatedUser.leveledUp || false,
    };
  } catch (error) {
    throw new Error(`Error updating user XP: ${error.message}`);
  }
};

/**
 * Check if user should level up and update level
 * @param {Object} user - User object
 * @returns {Object} Updated user object
 */
const checkAndUpdateLevel = async (user) => {
  try {
    // Get all user levels sorted by xp_required
    const levels = await UserLevel.findAll({
      order: [["xp_required", "DESC"]],
    });

    if (levels.length === 0) {
      throw new Error("No levels configured in system");
    }

    let newLevel = levels[0]; // Start with lowest level

    // Find the appropriate level based on current XP
    for (let i = levels.length - 1; i >= 0; i--) {
      if (user.current_xp >= levels[i].xp_required) {
        newLevel = levels[i];
        break;
      }
    }

    // Check if level changed
    const levelChanged = user.current_level_id !== newLevel.id;

    if (levelChanged) {
      user.current_level_id = newLevel.id;
      await user.save();
      user.leveledUp = true;
    }

    // Reload user with level info
    const updatedUser = await User.findByPk(user.id, {
      include: [{ model: UserLevel, as: "currentLevel" }],
    });

    updatedUser.leveledUp = levelChanged;
    return updatedUser;
  } catch (error) {
    throw new Error(`Error checking user level: ${error.message}`);
  }
};

/**
 * Get user progress summary
 * @param {Number} userId - User ID
 * @returns {Object} User progress data
 */
const getUserProgress = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [{ model: UserLevel, as: "currentLevel" }],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get next level info
    const nextLevel = await UserLevel.findOne({
      where: { level_no: user.currentLevel.level_no + 1 },
    });

    const xpToNextLevel = nextLevel
      ? nextLevel.xp_required - user.current_xp
      : 0;
    const progressPercentage = nextLevel
      ? Math.round(
          ((user.current_xp - user.currentLevel.xp_required) /
            (nextLevel.xp_required - user.currentLevel.xp_required)) *
            100,
        )
      : 100;

    return {
      userId: user.id,
      fullname: user.fullname,
      currentXP: user.current_xp,
      currentLevel: {
        id: user.currentLevel.id,
        level_no: user.currentLevel.level_no,
        level_name: user.currentLevel.level_name,
        xp_required: user.currentLevel.xp_required,
      },
      nextLevel: nextLevel
        ? {
            level_no: nextLevel.level_no,
            level_name: nextLevel.level_name,
            xp_required: nextLevel.xp_required,
          }
        : null,
      xpToNextLevel: Math.max(0, xpToNextLevel),
      progressPercentage: Math.min(progressPercentage, 100),
    };
  } catch (error) {
    throw new Error(`Error getting user progress: ${error.message}`);
  }
};


const getAllLevels = async () => {
  try {
    const levels = await UserLevel.findAll({
      order: [["level_no", "ASC"]],
    });

    return levels;
  } catch (error) {
    throw new Error(`Error fetching levels: ${error.message}`);
  }
};


const initializeDefaultLevels = async () => {
  try {
    const defaultLevels = [
      { level_no: 1, level_name: "Starter", xp_required: 0 },
      { level_no: 2, level_name: "Rookie", xp_required: 100 },
      { level_no: 3, level_name: "Learner", xp_required: 250 },
      { level_no: 4, level_name: "Explorer", xp_required: 450 },
      { level_no: 5, level_name: "Smart Brain", xp_required: 700 },
      { level_no: 6, level_name: "Quick Thinker", xp_required: 1000 },
      { level_no: 7, level_name: "Quiz Whiz", xp_required: 1400 },
      { level_no: 8, level_name: "Achiever", xp_required: 1900 },
      { level_no: 9, level_name: "Top Scorer", xp_required: 2500 },
      { level_no: 10, level_name: "Scholar", xp_required: 3200 },
      { level_no: 11, level_name: "Talent Master", xp_required: 4000 },
      { level_no: 12, level_name: "Super Scholar", xp_required: 5000 },
      { level_no: 13, level_name: "Genius", xp_required: 6200 },
      { level_no: 14, level_name: "Elite Mind", xp_required: 7500 },
      { level_no: 15, level_name: "Expert", xp_required: 9000 },
      { level_no: 16, level_name: "Champion", xp_required: 11000 },
      { level_no: 17, level_name: "Grand Champion", xp_required: 13500 },
      { level_no: 18, level_name: "Master", xp_required: 16500 },
      { level_no: 19, level_name: "Grandmaster", xp_required: 20000 },
      { level_no: 20, level_name: "Quiz Legend", xp_required: 25000 },
    ];

    const created = await UserLevel.bulkCreate(defaultLevels, {
      ignoreDuplicates: true,
    });

    return created;
  } catch (error) {
    throw new Error(`Error initializing default levels: ${error.message}`);
  }
};

module.exports = {
  calculateQuizXP,
  updateUserXPAndLevel,
  checkAndUpdateLevel,
  getUserProgress,
  getAllLevels,
  initializeDefaultLevels,
};
