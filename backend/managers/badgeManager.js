const { User, Badge, UserBadge } = require("../models/associations");
const { Op } = require("sequelize");

// Map English subject names to their Sinhala equivalent in the DB
const getSinhalaSubjectName = (name) => {
	const mapping = {
		"Environment": "පරිසරය",
		"Mathematics": "ගණිතය",
		"English": "ඉංග්‍රීසි",
		"IQ": "බුද්ධිය",
	};
	return mapping[name] || name;
};

// Helper to calculate subject rank dynamically
const getSubjectRank = async (userId, subjectName) => {
	try {
		const { QuizAttempt, Quiz, GradeHasSubject, Subject } = require("../models/associations");
		
		const allUsers = await User.findAll({ attributes: ["id"] });
		
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
									where: { 
										subject_name: {
											[Op.or]: [subjectName, getSinhalaSubjectName(subjectName)]
										}
									},
									required: true,
								},
							],
						},
					],
				},
			],
			attributes: ["user_id", "xp_gained"],
		});

		const userXpMap = {};
		attempts.forEach((att) => {
			userXpMap[att.user_id] = (userXpMap[att.user_id] || 0) + (att.xp_gained || 0);
		});

		const rankedList = allUsers.map((user) => {
			const subjectXp = userXpMap[user.id] || 0;
			return {
				id: user.id,
				xp: subjectXp,
			};
		});

		rankedList.sort((a, b) => b.xp - a.xp);
		
		const userIndex = rankedList.findIndex(item => item.id === userId);
		if (userIndex === -1) return 999;
		
		const userXp = userXpMap[userId] || 0;
		if (userXp === 0) return 999; // 0 XP means no rank on the leaderboard

		return userIndex + 1;
	} catch (err) {
		console.error(`Error calculating subject rank for ${subjectName}:`, err);
		return 999;
	}
};

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
	const { QuizAttempt, UserPaperBookmark, UserPaperProgress } = require("../models/associations");

	try {
		// Milestones based on XP / Levels / Bookmarks / Downloads
		if (badge.badge_type === "milestone") {
			// Level milestones check: Starter Badge, Rookie Badge, Learner Badge, etc.
			const levelBadges = {
				"Starter Badge": 1,
				"Rookie Badge": 2,
				"Learner Badge": 3,
				"Explorer Badge": 4,
				"Smart Brain Badge": 5,
				"Quick Thinker Badge": 6,
				"Quiz Whiz Badge": 7,
				"Achiever Badge": 8,
				"Top Scorer Badge": 9,
				"Scholar Badge": 10,
				"Talent Master Badge": 11,
				"Super Scholar Badge": 12,
				"Genius Badge": 13,
				"Elite Mind Badge": 14,
				"Expert Badge": 15,
				"Champion Badge": 16,
				"Grand Champion Badge": 17,
				"Master Badge": 18,
				"Grandmaster Badge": 19,
				"Quiz Legend Badge": 20
			};

			if (levelBadges[badge.name] !== undefined) {
				const requiredLevel = levelBadges[badge.name];
				const { UserLevel } = require("../models/associations");
				const levelRecord = await UserLevel.findByPk(user.current_level_id);
				return levelRecord && levelRecord.level_no >= requiredLevel;
			}

			// XP milestones
			if (badge.xp_required !== null && badge.xp_required !== undefined) {
				return user.current_xp >= badge.xp_required;
			}

			// Bookworm
			if (badge.name === "Bookworm") {
				const count = await UserPaperBookmark.count({ where: { user_id: user.id } });
				return count >= 10;
			}

			// Paper Master
			if (badge.name === "Paper Master") {
				const count = await UserPaperProgress.count({ 
					where: { 
						user_id: user.id, 
						downloaded_at: { [Op.ne]: null } 
					} 
				});
				return count >= 10;
			}
		}

		// Achievements
		if (badge.badge_type === "achievement") {
			if (badge.name === "First Steps") {
				const count = await QuizAttempt.count({ where: { user_id: user.id, is_completed: true } });
				return count >= 1;
			}

			if (badge.name === "Perfect Score") {
				const count = await QuizAttempt.count({ where: { user_id: user.id, is_completed: true, score: 100 } });
				return count >= 1;
			}

			if (badge.name === "Smart Saver") {
				const count = await UserPaperBookmark.count({ where: { user_id: user.id } });
				return count >= 1;
			}

			if (badge.name === "Collector") {
				const count = await UserPaperProgress.count({ 
					where: { 
						user_id: user.id, 
						downloaded_at: { [Op.ne]: null } 
					} 
				});
				return count >= 1;
			}
		}

		// Streaks
		if (badge.badge_type === "streak") {
			if (badge.name === "On Fire") {
				const count = await QuizAttempt.count({
					where: {
						user_id: user.id,
						is_completed: true,
						completed_at: {
							[Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
						},
					},
				});
				return count >= 5;
			}
		}

		// Special badges (Ranks / Subject leaderboards)
		if (badge.badge_type === "special") {
			if (badge.name === "Global Elite") {
				const countHigher = await User.count({
					where: {
						current_xp: {
							[Op.gt]: user.current_xp,
						},
					},
				});
				const rank = countHigher + 1;
				return rank <= 3 && user.current_xp > 0;
			}

			if (badge.name === "Environment Expert") {
				const rank = await getSubjectRank(user.id, "Environment");
				return rank <= 3;
			}

			if (badge.name === "Math Wizard") {
				const rank = await getSubjectRank(user.id, "Mathematics");
				return rank <= 3;
			}

			if (badge.name === "English Master") {
				const rank = await getSubjectRank(user.id, "English");
				return rank <= 3;
			}

			if (badge.name === "IQ Genius") {
				const rank = await getSubjectRank(user.id, "IQ");
				return rank <= 3;
			}
			
			if (badge.name === "Subject Expert") {
				const subjects = ["Sinhala", "Mathematics", "English", "Environment", "IQ"];
				for (const sub of subjects) {
					const rank = await getSubjectRank(user.id, sub);
					if (rank <= 3) return true;
				}
			}
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
				xp_required: null
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
				xp_required: null
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
				name: "Subject Expert",
				description: "Earn a top rank in any subject leaderboard. (ප්‍රවීණයා)",
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
			
			// ====== LEVEL MILESTONES ======
			{
				name: "Starter Badge",
				description: "Unlocked by reaching Level 1: Starter! (ආරම්භකයා)",
				icon_url: "/badges/level-1.png",
				badge_type: "milestone",
				xp_required: 0
			},
			{
				name: "Rookie Badge",
				description: "Unlocked by reaching Level 2: Rookie! (නවකයා)",
				icon_url: "/badges/level-2.png",
				badge_type: "milestone",
				xp_required: 100
			},
			{
				name: "Learner Badge",
				description: "Unlocked by reaching Level 3: Learner! (ශිෂ්‍යයා)",
				icon_url: "/badges/level-3.png",
				badge_type: "milestone",
				xp_required: 250
			},
			{
				name: "Explorer Badge",
				description: "Unlocked by reaching Level 4: Explorer! (ගවේෂකයා)",
				icon_url: "/badges/level-4.png",
				badge_type: "milestone",
				xp_required: 450
			},
			{
				name: "Smart Brain Badge",
				description: "Unlocked by reaching Level 5: Smart Brain! (නැණවතා)",
				icon_url: "/badges/level-5.png",
				badge_type: "milestone",
				xp_required: 700
			},
			{
				name: "Quick Thinker Badge",
				description: "Unlocked by reaching Level 6: Quick Thinker! (වේගවත් චින්තකයා)",
				icon_url: "/badges/level-6.png",
				badge_type: "milestone",
				xp_required: 1000
			},
			{
				name: "Quiz Whiz Badge",
				description: "Unlocked by reaching Level 7: Quiz Whiz! (ක්විස් දක්ෂයා)",
				icon_url: "/badges/level-7.png",
				badge_type: "milestone",
				xp_required: 1400
			},
			{
				name: "Achiever Badge",
				description: "Unlocked by reaching Level 8: Achiever! (ජයග්‍රාහකයා)",
				icon_url: "/badges/level-8.png",
				badge_type: "milestone",
				xp_required: 1900
			},
			{
				name: "Top Scorer Badge",
				description: "Unlocked by reaching Level 9: Top Scorer! (වැඩිම ලකුණු ලාභියා)",
				icon_url: "/badges/level-9.png",
				badge_type: "milestone",
				xp_required: 2500
			},
			{
				name: "Scholar Badge",
				description: "Unlocked by reaching Level 10: Scholar! (ශිෂ්‍යත්වධාරියා)",
				icon_url: "/badges/level-10.png",
				badge_type: "milestone",
				xp_required: 3200
			},
			{
				name: "Talent Master Badge",
				description: "Unlocked by reaching Level 11: Talent Master! (දක්ෂතා පූර්ණයා)",
				icon_url: "/badges/level-11.png",
				badge_type: "milestone",
				xp_required: 4000
			},
			{
				name: "Super Scholar Badge",
				description: "Unlocked by reaching Level 12: Super Scholar! (සුපිරි විද්වතා)",
				icon_url: "/badges/level-12.png",
				badge_type: "milestone",
				xp_required: 5000
			},
			{
				name: "Genius Badge",
				description: "Unlocked by reaching Level 13: Genius! (ප්‍රාඥයා)",
				icon_url: "/badges/level-13.png",
				badge_type: "milestone",
				xp_required: 6200
			},
			{
				name: "Elite Mind Badge",
				description: "Unlocked by reaching Level 14: Elite Mind! (සුවිශේෂී බුද්ධිමතා)",
				icon_url: "/badges/level-14.png",
				badge_type: "milestone",
				xp_required: 7500
			},
			{
				name: "Expert Badge",
				description: "Unlocked by reaching Level 15: Expert! (විශේෂඥයා)",
				icon_url: "/badges/level-15.png",
				badge_type: "milestone",
				xp_required: 9000
			},
			{
				name: "Champion Badge",
				description: "Unlocked by reaching Level 16: Champion! (ශූරයා)",
				icon_url: "/badges/levels/level-16.png",
				badge_type: "milestone",
				xp_required: 11000
			},
			{
				name: "Grand Champion Badge",
				description: "Unlocked by reaching Level 17: Grand Champion! (මහා ශූරයා)",
				icon_url: "/badges/level-17.png",
				badge_type: "milestone",
				xp_required: 13500
			},
			{
				name: "Master Badge",
				description: "Unlocked by reaching Level 18: Master! (ප්‍රවීණයා)",
				icon_url: "/badges/level-18.png",
				badge_type: "milestone",
				xp_required: 16500
			},
			{
				name: "Grandmaster Badge",
				description: "Unlocked by reaching Level 19: Grandmaster! (මහා ප්‍රවීණයා)",
				icon_url: "/badges/level-19.png",
				badge_type: "milestone",
				xp_required: 20000
			},
			{
				name: "Quiz Legend Badge",
				description: "Unlocked by reaching Level 20: Quiz Legend! (ක්විස් ජීවමාන වීරයා)",
				icon_url: "/badges/level-20.png",
				badge_type: "milestone",
				xp_required: 25000
			}
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
