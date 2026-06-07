const { User, UserLevel, UserBadge, Badge, Grade, QuizAttempt, UserPaperProgress, Quiz, Paper, UserReview } = require("../../../models/associations");
const sequelize = require("../../../config/db.config");

/**
 * Retrieves user profile details along with user level, grade, global rank,
 * badge gallery (earned and locked badges), recent activity list, and counts.
 */
const getUserProfileWithRank = async (req, res, next) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Get user data with level info and grade info
		const user = await User.findOne({
			where: { id: userId },
			include: [
				{
					model: UserLevel,
					as: "currentLevel",
					attributes: ["id", "level_no", "level_name", "xp_required"],
				},
				{
					model: Grade,
					as: "grade",
					attributes: ["id", "grade_name"],
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

		// Fetch all badges in system and user's earned badges to build dynamic Badge Gallery
		const allBadges = await Badge.findAll({
			attributes: ["id", "name", "description", "icon_url", "badge_type"]
		});

		const userBadges = await UserBadge.findAll({
			where: { user_id: userId },
			attributes: ["badge_id", "earned_at"]
		});

		const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

		const badgeGallery = allBadges.map((badge) => {
			const earned = earnedBadgeIds.has(badge.id);
			const userBadgeInfo = userBadges.find((ub) => ub.badge_id === badge.id);
			return {
				id: badge.id,
				name: badge.name,
				description: badge.description,
				icon_url: badge.icon_url,
				badge_type: badge.badge_type,
				earned,
				earned_at: userBadgeInfo ? userBadgeInfo.earned_at : null
			};
		});

		// Count completed quizzes
		const completedQuizzesCount = await QuizAttempt.count({
			where: { user_id: userId, is_completed: true }
		});

		// Count completed past papers
		const completedPapersCount = await UserPaperProgress.count({
			where: { user_id: userId, is_completed: true }
		});

		// Fetch recent activity: quiz attempts and completed papers
		const recentQuizzes = await QuizAttempt.findAll({
			where: { user_id: userId },
			include: [
				{
					model: Quiz,
					as: "quiz",
					attributes: ["quiz_name"],
				},
			],
			order: [["completed_at", "DESC"]],
			limit: 5,
		});

		const recentPapers = await UserPaperProgress.findAll({
			where: { user_id: userId, is_completed: true },
			include: [
				{
					model: Paper,
					as: "paper",
					attributes: ["title"],
				},
			],
			order: [["completed_at", "DESC"]],
			limit: 5,
		});

		const activities = [];
		recentQuizzes.forEach((q) => {
			activities.push({
				title: q.quiz?.quiz_name || "Quiz Challenge",
				completed_at: q.completed_at || q.started_at,
				type: "quiz",
				reward: q.xp_gained ? `+${q.xp_gained} XP` : "Completed",
				score: q.score !== null ? `Score: ${Math.round(q.score)}%` : "",
			});
		});

		recentPapers.forEach((p) => {
			activities.push({
				title: p.paper?.title || "Past Paper Completion",
				completed_at: p.completed_at || p.downloaded_at,
				type: "paper",
				reward: "Completed",
				score: "",
			});
		});

		// Sort merged activities by completed_at desc
		activities.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
		const recentActivity = activities.slice(0, 5);

		const review = await UserReview.findOne({
			where: { user_id: userId }
		});

		return res.status(200).json({
			status: "success",
			message: "User profile retrieved successfully",
			data: {
				id: user.id,
				fullname: user.fullname,
				username: user.username,
				email: user.email,
				school_name: user.school_name,
				profile_url: user.profile_url,
				grade_id: user.grade_id,
				scholarship_marks: review ? review.scholarship_marks : null,
				review_rating: review ? review.review_rating : null,
				review_text: review ? review.review_text : null,
				current_xp: user.current_xp,
				current_level_id: user.current_level_id,
				joined_at: user.joined_at,
				grade: user.grade ? {
					id: user.grade.id,
					grade_name: user.grade.grade_name
				} : null,
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
				badgeGallery,
				recentBadges: badgeGallery
					.filter((b) => b.earned)
					.sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
					.slice(0, 4),
				earnedBadgesCount: userBadges.length,
				totalBadgesCount: allBadges.length,
				completedQuizzesCount,
				completedPapersCount,
				recentActivity,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Updates user profile details: fullname, grade_id, school_name, and profile_url (avatar).
 */
const updateProfile = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { fullname, grade_id, school_name, profile_url } = req.body;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Validation
		const errors = {};
		if (!fullname || !fullname.trim()) {
			errors.fullname = "Full name is required.";
		}
		if (!grade_id) {
			errors.grade_id = "Grade is required.";
		}
		if (!school_name || !school_name.trim()) {
			errors.school_name = "School name is required.";
		}
		if (!profile_url || !profile_url.trim()) {
			errors.profile_url = "Profile image/avatar URL is required.";
		}

		if (Object.keys(errors).length > 0) {
			return res.status(400).json({
				status: "fail",
				message: "Validation failed",
				fieldErrors: errors,
			});
		}

		// Find user
		const user = await User.findByPk(userId);
		if (!user) {
			return res.status(404).json({
				status: "fail",
				message: "User not found",
			});
		}

		// Verify selected grade exists
		const gradeInstance = await Grade.findByPk(grade_id);
		if (!gradeInstance) {
			return res.status(400).json({
				status: "fail",
				message: "Validation failed",
				fieldErrors: { grade_id: "Selected grade is invalid." },
			});
		}

		// Update details
		user.fullname = fullname.trim();
		user.grade_id = Number(grade_id);
		user.school_name = school_name.trim();
		user.profile_url = profile_url.trim();

		await user.save();

		// Reload user with new associations for the response
		const updatedUser = await User.findOne({
			where: { id: userId },
			include: [
				{
					model: UserLevel,
					as: "currentLevel",
					attributes: ["id", "level_no", "level_name", "xp_required"],
				},
				{
					model: Grade,
					as: "grade",
					attributes: ["id", "grade_name"],
				},
			],
		});

		return res.status(200).json({
			status: "success",
			message: "Profile updated successfully",
			data: {
				id: updatedUser.id,
				fullname: updatedUser.fullname,
				username: updatedUser.username,
				email: updatedUser.email,
				school_name: updatedUser.school_name,
				profile_url: updatedUser.profile_url,
				grade_id: updatedUser.grade_id,
				current_xp: updatedUser.current_xp,
				current_level_id: updatedUser.current_level_id,
				joined_at: updatedUser.joined_at,
				grade: updatedUser.grade ? {
					id: updatedUser.grade.id,
					grade_name: updatedUser.grade.grade_name
				} : null,
				level: {
					id: updatedUser.currentLevel?.id,
					level_no: updatedUser.currentLevel?.level_no,
					level_name: updatedUser.currentLevel?.level_name,
				}
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Updates user review/testimonial details: scholarship_marks, review_rating, and review_text.
 */
const updateReview = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { scholarship_marks, review_rating, review_text } = req.body;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Validation
		if (scholarship_marks !== undefined && scholarship_marks !== null) {
			const marks = Number(scholarship_marks);
			if (isNaN(marks) || marks < 0 || marks > 200) {
				return res.status(400).json({
					status: "fail",
					message: "Scholarship marks must be a valid number between 0 and 200.",
				});
			}
		}

		if (review_rating !== undefined && review_rating !== null) {
			const rating = Number(review_rating);
			if (isNaN(rating) || rating < 1 || rating > 5) {
				return res.status(400).json({
					status: "fail",
					message: "Review rating must be a valid integer between 1 and 5.",
				});
			}
		}

		let review = await UserReview.findOne({
			where: { user_id: userId }
		});

		if (!review) {
			review = await UserReview.create({
				user_id: userId,
				scholarship_marks: scholarship_marks !== "" && scholarship_marks !== undefined ? Number(scholarship_marks) : 0,
				review_rating: review_rating !== "" && review_rating !== undefined ? Number(review_rating) : 5,
				review_text: review_text !== "" && review_text !== undefined ? review_text.trim() : "",
			});
		} else {
			if (scholarship_marks !== undefined) review.scholarship_marks = scholarship_marks !== "" ? Number(scholarship_marks) : 0;
			if (review_rating !== undefined) review.review_rating = review_rating !== "" ? Number(review_rating) : 5;
			if (review_text !== undefined) review.review_text = review_text !== "" ? review_text.trim() : "";
			await review.save();
		}

		return res.status(200).json({
			status: "success",
			message: "Review updated successfully",
			data: {
				scholarship_marks: review.scholarship_marks,
				review_rating: review.review_rating,
				review_text: review.review_text,
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getUserProfileWithRank,
	updateProfile,
	updateReview,
};
