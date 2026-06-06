const { User, Badge, UserBadge } = require("../models/associations");
const { Op } = require("sequelize");

/**
 * Check and award badges to user based on XP and criteria
 * @param {Number} userId - User ID
 * @returns {Array} Newly earned badges
 */
const checkAndAwardBadges = async (userId) => {
	try {
		const user = await User.findByPk(userId, {
			include: [
				{
					model: Badge,
					as: "badges",
					through: { attributes: [] },
				},
			],
		});

		if (!user) {
			throw new Error("User not found");
		}

		// Get all available badges
		const allBadges = await Badge.findAll();
		const userBadgeIds = user.badges.map((b) => b.id);

		const newlyEarned = [];

		// Check each badge criteria
		for (const badge of allBadges) {
			// Skip if user already has badge
			if (userBadgeIds.includes(badge.id)) {
				continue;
			}

			// Check if user qualifies for badge
			const qualifies = await checkBadgeCriteria(user, badge);

			if (qualifies) {
				// Award badge to user
				await UserBadge.create({
					user_id: userId,
					badge_id: badge.id,
					earned_at: new Date(),
				});

				newlyEarned.push(badge);
			}
		}

		return newlyEarned;
	} catch (error) {
		throw new Error(`Error checking badges: ${error.message}`);
	}
};

/**
 * Check if user meets badge criteria
 * @param {Object} user - User object
 * @param {Object} badge - Badge object
 * @returns {Boolean} Whether user qualifies for badge
 */
const checkBadgeCriteria = async (user, badge) => {
	const { QuizAttempt, UserAnswer } = require("../models/associations");

	try {
		// XP-based badge
		if (badge.badge_type === "milestone" && badge.xp_required) {
			return user.current_xp >= badge.xp_required;
		}

		// Streak badge
		if (badge.badge_type === "streak") {
			// Get recent successful quiz attempts
			const recentAttempts = await QuizAttempt.findAll({
				where: {
					user_id: user.id,
					is_completed: true,
					completed_at: {
						[Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
					},
				},
				order: [["completed_at", "DESC"]],
				limit: 5,
			});

			// Streak badge requires 5+ completed quizzes in a week
			return recentAttempts.length >= 5;
		}

		// Achievement badge (could be based on perfection - 100% score)
		if (badge.badge_type === "achievement") {
			const perfectAttempts = await QuizAttempt.findAll({
				where: {
					user_id: user.id,
					is_completed: true,
					score: 100, // Perfect score
				},
				limit: 1,
			});

			return perfectAttempts.length > 0;
		}

		// Special badges (manually awarded or based on custom logic)
		if (badge.badge_type === "special") {
			return false; // Special badges are manually awarded
		}

		return false;
	} catch (error) {
		console.error(`Error checking badge criteria for ${badge.name}:`, error);
		return false;
	}
};

/**
 * Get user badges
 * @param {Number} userId - User ID
 * @returns {Array} User badges with earned dates
 */
const getUserBadges = async (userId) => {
	try {
		const userBadges = await UserBadge.findAll({
			where: { user_id: userId },
			include: [
				{
					model: Badge,
					as: "badge",
				},
			],
			order: [["earned_at", "DESC"]],
		});

		return userBadges.map((ub) => ({
			...ub.badge.dataValues,
			earned_at: ub.earned_at,
		}));
	} catch (error) {
		throw new Error(`Error fetching user badges: ${error.message}`);
	}
};

/**
 * Create default badges in system
 * @returns {Array} Created badges
 */
const createDefaultBadges = async () => {
	try {
		const defaultBadges = [
		// ====== ACHIEVEMENTS ======
	{
		name: "First Steps",
		description: "Complete your first quiz! (පළමු පියවර)",
		icon_url: "/badges/first-steps.png",
		badge_type: "achievement",
		xp_required: null // මුලින්ම ක්විස් එකක් කරපු ගමන් ලැබෙන නිසා XP අගයක් අවශ්‍ය නැත
	},
	{
		name: "Perfect Score",
		description: "Score 100% on a quiz. (සියයට සියයක් නියමයි)",
		icon_url: "/badges/perfect.png",
		badge_type: "achievement",
		xp_required: null
	},
	{
		name: "Smart Saver",
		description: "Bookmark your very first past paper. (පසුකාලීන අධ්‍යයනයට)",
		icon_url: "/badges/first-bookmark.png",
		badge_type: "achievement",
		xp_required: null
	},
	{
		name: "Collector",
		description: "Download your first past paper. (පත්‍රිකා එකතු කරන්නා)",
		icon_url: "/badges/first-download.png",
		badge_type: "achievement",
		xp_required: null
	},

	// ====== MILESTONES (XP සහ ප්‍රමාණයන් අනුව) ======
	{
		name: "Century",
		description: "Reach 100 XP. (සියයේ කඩඉම)",
		icon_url: "/badges/century.png",
		badge_type: "milestone",
		xp_required: 100
	},
	{
		name: "Thousand",
		description: "Reach 1000 XP. (දහසේ කඩඉම)",
		icon_url: "/badges/thousand.png",
		badge_type: "milestone",
		xp_required: 1000
	},
	{
		name: "Bookworm",
		description: "Bookmark 10 past papers for revision. (පොත් ගුල්ලා)",
		icon_url: "/badges/ten-bookmarks.png",
		badge_type: "milestone",
		xp_required: null // ප්‍රමාණය 10ක් නිසා Logic එකෙන් Check කල හැක
	},
	{
		name: "Paper Master",
		description: "Download 10 past papers to study offline. (විභාග සිසුවා)",
		icon_url: "/badges/ten-downloads.png",
		badge_type: "milestone",
		xp_required: null
	},
	{
		name: "Legend",
		description: "Reach Legend level by scoring 5000+ XP. (අතිජාත ප්‍රාඥයා)",
		icon_url: "/badges/legend.png",
		badge_type: "milestone",
		xp_required: 5000
	},

	// ====== STREAKS ======
	{
		name: "On Fire",
		description: "Complete 5 quizzes in a week. (නොනවතන ගමන)",
		icon_url: "/badges/on-fire.png",
		badge_type: "streak",
		xp_required: null
	},

	// ====== SPECIAL (Ranks / Leaderboard) ======
	{
		name: "Environment Expert",
		description: "Earn a top rank in Environment subject leaderboard.",
		icon_url: "/badges/subject-expert.png",
		badge_type: "special",
		xp_required: null
	},
	{
		name: "Global Elite",
		description: "Reach the top ranks on the Global Leaderboard! (ලෝක වීරයා)",
		icon_url: "/badges/global-rank.png",
		badge_type: "special",
		xp_required: null
	},
	// ====== SPECIAL (Ranks / Leaderboard per Subject) ======
	{
		name: "Environment Expert",
		description: "Earn a top rank in the Environment subject leaderboard. (පරිසර ප්‍රවීණයා)",
		icon_url: "/badges/environment-expert.png",
		badge_type: "special",
		xp_required: null
	},
	{
		name: "Math Wizard",
		description: "Earn a top rank in the Mathematics subject leaderboard. (ගණිත මිනින්දෝරුවා)",
		icon_url: "/badges/math-wizard.png",
		badge_type: "special",
		xp_required: null
	},
	{
		name: "English Master",
		description: "Earn a top rank in the English subject leaderboard. (ඉංග්‍රීසි ශූරයා)",
		icon_url: "/badges/english-master.png",
		badge_type: "special",
		xp_required: null
	},
	{
		name: "IQ Genius",
		description: "Earn a top rank in the IQ (Intelligence Quotient) leaderboard. (බුද්ධි පරීක්ෂණ අභියෝගකයා)",
		icon_url: "/badges/iq-genius.png",
		badge_type: "special",
		xp_required: null
	},
		];

		const created = await Badge.bulkCreate(defaultBadges, {
			ignoreDuplicates: true,
		});

		return created;
	} catch (error) {
		throw new Error(`Error creating default badges: ${error.message}`);
	}
};

module.exports = {
	checkAndAwardBadges,
	checkBadgeCriteria,
	getUserBadges,
	createDefaultBadges,
};
