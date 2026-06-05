const express = require("express");
const router = express.Router();
const { uploadSingleFile, UPLOAD_CONFIG, deleteUploadedFile } = require("../../middleware/fileUpload");
const { requireUser } = require("../../middleware/auth");

/**
 * Upload question image
 * POST /api/v1/uploads/quiz-questions
 */
router.post("/quiz-questions", requireUser, uploadSingleFile("quiz-questions"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				status: "fail",
				message: "No file uploaded",
			});
		}

		const fileUrl = UPLOAD_CONFIG.getUrlPath("quiz-questions", req.file.filename);

		res.status(200).json({
			status: "success",
			message: "Quiz question image uploaded successfully",
			data: {
				filename: req.file.filename,
				originalName: req.file.originalname,
				url: fileUrl,
				size: req.file.size,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "fail",
			message: error.message,
		});
	}
});

/**
 * Upload paper PDF
 * POST /api/v1/uploads/papers
 */
router.post("/papers", requireUser, uploadSingleFile("papers"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				status: "fail",
				message: "No file uploaded",
			});
		}

		const fileUrl = UPLOAD_CONFIG.getUrlPath("papers", req.file.filename);

		res.status(200).json({
			status: "success",
			message: "Paper PDF uploaded successfully",
			data: {
				filename: req.file.filename,
				originalName: req.file.originalname,
				url: fileUrl,
				size: req.file.size,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "fail",
			message: error.message,
		});
	}
});

/**
 * Upload badge image
 * POST /api/v1/uploads/badges
 */
router.post("/badges", requireUser, uploadSingleFile("badges"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				status: "fail",
				message: "No file uploaded",
			});
		}

		const fileUrl = UPLOAD_CONFIG.getUrlPath("badges", req.file.filename);

		res.status(200).json({
			status: "success",
			message: "Badge image uploaded successfully",
			data: {
				filename: req.file.filename,
				originalName: req.file.originalname,
				url: fileUrl,
				size: req.file.size,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "fail",
			message: error.message,
		});
	}
});

/**
 * Upload profile picture
 * POST /api/v1/uploads/profiles
 */
router.post("/profiles", requireUser, uploadSingleFile("profiles"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				status: "fail",
				message: "No file uploaded",
			});
		}

		const fileUrl = UPLOAD_CONFIG.getUrlPath("profiles", req.file.filename);

		res.status(200).json({
			status: "success",
			message: "Profile picture uploaded successfully",
			data: {
				filename: req.file.filename,
				originalName: req.file.originalname,
				url: fileUrl,
				size: req.file.size,
			},
		});
	} catch (error) {
		res.status(500).json({
			status: "fail",
			message: error.message,
		});
	}
});

/**
 * Delete uploaded file
 * DELETE /api/v1/uploads/:type/:filename
 */
router.delete("/:type/:filename", requireUser, (req, res) => {
	try {
		const { type, filename } = req.params;

		// Validate type
		const validTypes = Object.values(UPLOAD_CONFIG.DIRS);
		if (!validTypes.includes(type)) {
			return res.status(400).json({
				status: "fail",
				message: "Invalid file type",
			});
		}

		const deleted = deleteUploadedFile(type, filename);

		if (!deleted) {
			return res.status(404).json({
				status: "fail",
				message: "File not found",
			});
		}

		res.status(200).json({
			status: "success",
			message: "File deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: "fail",
			message: error.message,
		});
	}
});

module.exports = router;
