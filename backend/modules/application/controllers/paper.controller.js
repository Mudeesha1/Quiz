const { Paper, SubjectHasYear, Subject, Year, UserPaperProgress, UserPaperBookmark } = require("../../../models/associations");
const badgeManager = require("../../../managers/badgeManager");
const fs = require("fs");
const path = require("path");
const { UPLOAD_CONFIG } = require("../../../middleware/fileUpload");

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

			// Read file size dynamically from disk
			let size = null;
			if (paper.pdf_url) {
				try {
					const filePath = path.join(__dirname, "../../../uploads", paper.pdf_url);
					if (fs.existsSync(filePath)) {
						const stats = fs.statSync(filePath);
						size = stats.size;
					}
				} catch (err) {
					console.error("Error getting file size dynamically:", err.message);
				}
			}

			return {
				id: paper.id,
				title: paper.title,
				detail: paper.detail,
				image_url: paper.image_url,
				pdf_url: paper.pdf_url,
				subject: paper.subjectHasYear?.subject?.subject_name || "Other",
				year: paper.subjectHasYear?.year?.years_name || "Unknown",
				created_at: paper.created_at,
				isDownloaded,
				isCompleted,
				isBookmarked,
				size,
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
 * Create a paper record from an uploaded PDF.
 */
const createPaper = async (req, res, next) => {
	try {
		const { title, detail, subject, year } = req.body;
		const uploadedFiles = req.files;

		// Validate required fields
		if (!title || !subject || !year || !uploadedFiles?.file) {
			return res.status(400).json({
				status: "fail",
				message: "Title, subject, year, and a PDF file are required",
			});
		}

		const pdfFile = uploadedFiles.file[0];
		const imageFile = uploadedFiles.image?.[0] || null;

		let subjectRecord = await Subject.findOne({
			where: { subject_name: subject },
		});

		if (!subjectRecord) {
			subjectRecord = await Subject.create({ subject_name: subject });
		}

		// Normalize year to integer
		const normalizedYear = Number.parseInt(String(year || "").trim(), 10);

		if (!Number.isInteger(normalizedYear)) {
			return res.status(400).json({
				status: "fail",
				message: "A valid year is required",
			});
		}

		let yearRecord = await Year.findOne({
			where: { years_name: normalizedYear },
		});

		if (!yearRecord) {
			yearRecord = await Year.create({ years_name: normalizedYear });
		}

		let subjectHasYear = await SubjectHasYear.findOne({
			where: {
				subjects_id: subjectRecord.id,
				years_id: yearRecord.id,
			},
		});

		if (!subjectHasYear) {
			subjectHasYear = await SubjectHasYear.create({
				subjects_id: subjectRecord.id,
				years_id: yearRecord.id,
			});
		}

		// Generate URLs for uploaded files
		const pdfUrl = `/papers/${pdfFile.filename}`;
		const imageUrl = imageFile ? `/papers/img/${imageFile.filename}` : null;

		const paper = await Paper.create({
			title,
			detail: detail || "",
			image_url: imageUrl,
			pdf_url: pdfUrl,
			subjects_has_years_id: subjectHasYear.id,
		});

		return res.status(201).json({
			status: "success",
			message: "Paper created successfully",
			data: {
				paper,
				subject: subjectRecord.subject_name,
				year: yearRecord.years_name,
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

/**
 * Update a paper record, allowing updates to fields and optional files.
 */
const updatePaper = async (req, res, next) => {
	try {
		const { paperId } = req.params;
		const { title, detail, subject, year } = req.body;
		const uploadedFiles = req.files;

		const paper = await Paper.findByPk(paperId);
		if (!paper) {
			return res.status(404).json({
				status: "fail",
				message: "Paper not found",
			});
		}

		if (title) paper.title = title.trim();
		if (detail !== undefined) paper.detail = detail ? detail.trim() : null;

		// Handle subject & year if updated
		if (subject || year) {
			let subjectRecord = null;
			if (subject) {
				subjectRecord = await Subject.findOne({ where: { subject_name: subject } });
				if (!subjectRecord) {
					subjectRecord = await Subject.create({ subject_name: subject });
				}
			} else {
				const existingSubjectHasYear = await SubjectHasYear.findByPk(paper.subjects_has_years_id, {
					include: [{ model: Subject, as: "subject" }]
				});
				subjectRecord = existingSubjectHasYear?.subject;
			}

			let yearRecord = null;
			if (year) {
				const normalizedYear = Number.parseInt(String(year).trim(), 10);
				if (!Number.isInteger(normalizedYear)) {
					return res.status(400).json({ status: "fail", message: "A valid year is required" });
				}
				yearRecord = await Year.findOne({ where: { years_name: normalizedYear } });
				if (!yearRecord) {
					yearRecord = await Year.create({ years_name: normalizedYear });
				}
			} else {
				const existingSubjectHasYear = await SubjectHasYear.findByPk(paper.subjects_has_years_id, {
					include: [{ model: Year, as: "year" }]
				});
				yearRecord = existingSubjectHasYear?.year;
			}

			if (subjectRecord && yearRecord) {
				let subjectHasYear = await SubjectHasYear.findOne({
					where: { subjects_id: subjectRecord.id, years_id: yearRecord.id }
				});
				if (!subjectHasYear) {
					subjectHasYear = await SubjectHasYear.create({
						subjects_id: subjectRecord.id,
						years_id: yearRecord.id
					});
				}
				paper.subjects_has_years_id = subjectHasYear.id;
			}
		}

		// Handle files
		if (uploadedFiles?.file?.[0]) {
			paper.pdf_url = `/papers/${uploadedFiles.file[0].filename}`;
		}
		if (uploadedFiles?.image?.[0]) {
			paper.image_url = `/papers/img/${uploadedFiles.image[0].filename}`;
		}

		await paper.save();

		// Fetch updated paper details for response
		const updatedPaper = await Paper.findByPk(paper.id, {
			include: [
				{
					model: SubjectHasYear,
					as: "subjectHasYear",
					include: [
						{ model: Subject, as: "subject", attributes: ["id", "subject_name"] },
						{ model: Year, as: "year", attributes: ["id", "years_name"] }
					]
				}
			]
		});

		// Calculate dynamic size
		let size = null;
		try {
			const fs = require("fs");
			const path = require("path");
			const filePath = path.join(__dirname, "../../../uploads", updatedPaper.pdf_url);
			if (fs.existsSync(filePath)) {
				const stats = fs.statSync(filePath);
				size = stats.size;
			}
		} catch (err) {
			// ignore
		}

		return res.status(200).json({
			status: "success",
			message: "Paper updated successfully",
			data: {
				paper: {
					id: updatedPaper.id,
					title: updatedPaper.title,
					detail: updatedPaper.detail,
					image_url: updatedPaper.image_url,
					pdf_url: updatedPaper.pdf_url,
					subject: updatedPaper.subjectHasYear?.subject?.subject_name || "Other",
					year: updatedPaper.subjectHasYear?.year?.years_name || "Unknown",
					created_at: updatedPaper.created_at,
					size
				}
			}
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Add a new subject metadata to the database.
 */
const createSubject = async (req, res, next) => {
	try {
		const { subject_name } = req.body;
		if (!subject_name || !subject_name.trim()) {
			return res.status(400).json({
				status: "fail",
				message: "Subject name is required",
			});
		}

		const [subject, created] = await Subject.findOrCreate({
			where: { subject_name: subject_name.trim() }
		});

		return res.status(201).json({
			status: "success",
			message: created ? "Subject added successfully" : "Subject already exists",
			data: subject,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Add a new year metadata to the database.
 */
const createYear = async (req, res, next) => {
	try {
		const { year } = req.body;
		if (!year) {
			return res.status(400).json({
				status: "fail",
				message: "Year is required",
			});
		}

		const normalizedYear = Number.parseInt(String(year).trim(), 10);
		if (!Number.isInteger(normalizedYear)) {
			return res.status(400).json({
				status: "fail",
				message: "A valid integer year is required",
			});
		}

		const [yearRecord, created] = await Year.findOrCreate({
			where: { years_name: normalizedYear }
		});

		return res.status(201).json({
			status: "success",
			message: created ? "Year added successfully" : "Year already exists",
			data: yearRecord,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getPapers,
	createPaper,
	updatePaper,
	downloadPaper,
	bookmarkPaper,
	completePaper,
	createSubject,
	createYear,
};
