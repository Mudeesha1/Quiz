const User = require("../../../models/users.model");
const UserLevel = require("../../../models/userLevel.model");
const UserBadge = require("../../../models/userBadge.model");
const Badge = require("../../../models/badge.model");
const sequelize = require("../../../config/db.config");

const getUserProfileWithRank = async (req, res, next) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Get user data with level info
		const user = await User.findOne({
			where: { id: userId },
			include: [
				{
					model: UserLevel,
					as: "currentLevel",
					attributes: ["id", "level_no", "level_name", "xp_required"],
				},
			],
		});

		if (!user) {
			return res.status(404).json({
				status: "fail",
				message: "User not found",
			});
		}

		// Calculate global rank - count users with more XP
		const rank = await User.count({
			where: sequelize.where(
				sequelize.col("current_xp"),
				">",
				user.current_xp
			),
		});

		// Calculate progress to next level
		const nextLevel = await UserLevel.findOne({
			where: sequelize.where(
				sequelize.col("xp_required"),
				">",
				user.currentLevel?.xp_required || 0
			),
			order: [["xp_required", "ASC"]],
		});

		const currentLevelXpRequired = user.currentLevel?.xp_required || 0;
		const nextLevelXpRequired = nextLevel?.xp_required || currentLevelXpRequired + 1000;
		const xpInCurrentLevel = user.current_xp - currentLevelXpRequired;
		const xpNeededForNextLevel = nextLevelXpRequired - currentLevelXpRequired;

		// Fetch user's badges (most recent first)
		const userBadges = await UserBadge.findAll({
			where: { user_id: userId },
			include: [
				{
					model: Badge,
					as: "badge",
					attributes: ["id", "name", "description", "icon_url", "badge_type"],
				},
			],
			order: [["earned_at", "DESC"]],
			limit: 3,
		});

		const badges = userBadges.map((ub) => ({
			id: ub.badge.id,
			name: ub.badge.name,
			description: ub.badge.description,
			icon_url: ub.badge.icon_url,
			badge_type: ub.badge.badge_type,
			earned_at: ub.earned_at,
		}));

		return res.status(200).json({
			status: "success",
			message: "User profile retrieved successfully",
			data: {
				id: user.id,
				fullname: user.fullname,
				username: user.username,
				email: user.email,
				profile_url: user.profile_url,
				grade_id: user.grade_id,
				current_xp: user.current_xp,
				current_level_id: user.current_level_id,
				level: {
					id: user.currentLevel?.id,
					level_no: user.currentLevel?.level_no,
					level_name: user.currentLevel?.level_name,
					xp_required: user.currentLevel?.xp_required,
				},
				rank: rank + 1, // rank + 1 because count returns users with MORE xp
				xp_progress: {
					current: xpInCurrentLevel,
					needed: xpNeededForNextLevel,
					percentage: Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100),
				},
				recentBadges: badges,
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = getUserProfileWithRank;
