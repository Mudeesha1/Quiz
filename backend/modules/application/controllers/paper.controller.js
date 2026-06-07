const { Paper, SubjectHasYear, Subject, Year, UserPaperProgress, UserPaperBookmark } = require("../../../models/associations");
const badgeManager = require("../../../managers/badgeManager");

/**
 * Get all papers along with unique subjects and years for filters,
 * and include user-specific progress and bookmark status.
 */
const getPapers = async (req, res, next) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Fetch all papers with associations, filter progress & bookmarks by current user
		const papers = await Paper.findAll({
			include: [
				{
					model: SubjectHasYear,
					as: "subjectHasYear",
					include: [
						{
							model: Subject,
							as: "subject",
							attributes: ["id", "subject_name"],
						},
						{
							model: Year,
							as: "year",
							attributes: ["id", "years_name"],
						},
					],
				},
				{
					model: UserPaperProgress,
					as: "userProgress",
					where: { user_id: userId },
					required: false,
				},
				{
					model: UserPaperBookmark,
					as: "userBookmarks",
					where: { user_id: userId },
					required: false,
				},
			],
			order: [["created_at", "DESC"]],
		});

		// Fetch all subjects and years from DB for filters
		const dbSubjects = await Subject.findAll({ order: [["subject_name", "ASC"]] });
		const dbYears = await Year.findAll({ order: [["years_name", "DESC"]] });

		// Format papers for frontend
		const formattedPapers = papers.map((paper) => {
			const isDownloaded = paper.userProgress && paper.userProgress.length > 0 && paper.userProgress[0].downloaded_at !== null;
			const isCompleted = paper.userProgress && paper.userProgress.length > 0 && paper.userProgress[0].is_completed === true;
			const isBookmarked = paper.userBookmarks && paper.userBookmarks.length > 0;

			return {
				id: paper.id,
				title: paper.title,
				detail: paper.detail,
				image_url: paper.image_url,
				pdf_url: paper.pdf_url,
				subject: paper.subjectHasYear?.subject?.subject_name || "Other",
				year: paper.subjectHasYear?.year?.years_name || "Unknown",
				isDownloaded,
				isCompleted,
				isBookmarked,
			};
		});

		return res.status(200).json({
			status: "success",
			data: {
				papers: formattedPapers,
				subjects: ["All Subjects", ...dbSubjects.map((s) => s.subject_name)],
				years: ["All Years", ...dbYears.map((y) => y.years_name)],
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Register or update download action for a paper.
 */
const downloadPaper = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { paperId } = req.params;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Verify paper exists
		const paper = await Paper.findByPk(paperId);
		if (!paper) {
			return res.status(404).json({
				status: "fail",
				message: "Paper not found",
			});
		}

		// Find or create progress record
		const [progress, created] = await UserPaperProgress.findOrCreate({
			where: { user_id: userId, paper_id: paperId },
			defaults: {
				downloaded_at: new Date(),
				is_completed: false,
			},
		});

		if (!created) {
			progress.downloaded_at = new Date();
			await progress.save();
		}

		// Check and award badges
		const newlyEarnedBadges = await badgeManager.checkAndAwardBadges(userId);

		return res.status(200).json({
			status: "success",
			message: "Paper download status updated successfully",
			data: progress,
			newlyEarnedBadges: newlyEarnedBadges || [],
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Toggle bookmark status for a paper.
 */
const bookmarkPaper = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { paperId } = req.params;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Verify paper exists
		const paper = await Paper.findByPk(paperId);
		if (!paper) {
			return res.status(404).json({
				status: "fail",
				message: "Paper not found",
			});
		}

		// Check if bookmark exists
		const bookmark = await UserPaperBookmark.findOne({
			where: { user_id: userId, paper_id: paperId },
		});

		if (bookmark) {
			await bookmark.destroy();
			return res.status(200).json({
				status: "success",
				message: "Bookmark removed successfully",
				bookmarked: false,
				newlyEarnedBadges: [],
			});
		} else {
			const newBookmark = await UserPaperBookmark.create({
				user_id: userId,
				paper_id: paperId,
				bookmarked_at: new Date(),
			});

			// Check and award badges
			const newlyEarnedBadges = await badgeManager.checkAndAwardBadges(userId);

			return res.status(200).json({
				status: "success",
				message: "Bookmark added successfully",
				bookmarked: true,
				data: newBookmark,
				newlyEarnedBadges: newlyEarnedBadges || [],
			});
		}
	} catch (error) {
		next(error);
	}
};

/**
 * Mark a paper as completed.
 */
const completePaper = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { paperId } = req.params;

		if (!userId) {
			return res.status(401).json({
				status: "fail",
				message: "Unauthorized: User ID not found",
			});
		}

		// Verify paper exists
		const paper = await Paper.findByPk(paperId);
		if (!paper) {
			return res.status(404).json({
				status: "fail",
				message: "Paper not found",
			});
		}

		// Find or create progress record
		const [progress, created] = await UserPaperProgress.findOrCreate({
			where: { user_id: userId, paper_id: paperId },
			defaults: {
				is_completed: true,
				completed_at: new Date(),
			},
		});

		if (!created) {
			progress.is_completed = true;
			progress.completed_at = new Date();
			await progress.save();
		}

		// Check and award badges
		const newlyEarnedBadges = await badgeManager.checkAndAwardBadges(userId);

		return res.status(200).json({
			status: "success",
			message: "Paper marked as completed successfully",
			data: progress,
			newlyEarnedBadges: newlyEarnedBadges || [],
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getPapers,
	downloadPaper,
	bookmarkPaper,
	completePaper,
};
