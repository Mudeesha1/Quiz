const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UPLOAD_CONFIG = require("../config/upload.config");

/**
 * Helper to get key from upload type
 */
const getConfigKey = (uploadType) => {
	return uploadType.toUpperCase().replace(/-/g, "_");
};

/**
 * Create storage configuration for multer
 */
const createStorage = (uploadType) => {
	try {
		const uploadPath = UPLOAD_CONFIG.getUploadPath(uploadType);

		// Ensure directory exists
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}

		return multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, uploadPath);
			},
			filename: (req, file, cb) => {
				// Generate unique filename
				const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
				const ext = path.extname(file.originalname);
				const name = path.basename(file.originalname, ext);
				cb(null, `${name}-${uniqueSuffix}${ext}`);
			},
		});
	} catch (error) {
		console.error("Error creating storage:", error);
		throw error;
	}
};

/**
 * File filter for validating uploads
 */
const createFileFilter = (uploadType) => {
	return (req, file, cb) => {
		try {
			if (uploadType === "papers") {
				if (file.fieldname === "file") {
					if (file.mimetype === "application/pdf") {
						return cb(null, true);
					}
					return cb(new Error("Invalid file type. Only PDF is allowed for paper file."));
				} else if (file.fieldname === "image") {
					const allowedImageMimes = ["image/jpeg", "image/png", "image/webp"];
					if (allowedImageMimes.includes(file.mimetype)) {
						return cb(null, true);
					}
					return cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP are allowed for cover image."));
				}
			}

			const configKey = getConfigKey(uploadType);
			const allowedMimes = UPLOAD_CONFIG.ALLOWED_MIME_TYPES[configKey];

			if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
				return cb(
					new Error(
						`Invalid file type. Allowed: ${allowedMimes?.join(", ") || "unknown"}`
					)
				);
			}

			cb(null, true);
		} catch (error) {
			cb(error);
		}
	};
};

/**
 * Custom storage for paper uploads
 */
const createPaperStorage = () => {
	const papersDir = path.join(__dirname, "../uploads/papers");
	const imagesDir = path.join(papersDir, "img");

	// Ensure directories exist
	if (!fs.existsSync(papersDir)) {
		fs.mkdirSync(papersDir, { recursive: true });
	}
	if (!fs.existsSync(imagesDir)) {
		fs.mkdirSync(imagesDir, { recursive: true });
	}

	return multer.diskStorage({
		destination: (req, file, cb) => {
			if (file.fieldname === "image") {
				cb(null, imagesDir);
			} else {
				cb(null, papersDir);
			}
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		},
	});
};

/**
 * Single file upload middleware
 */
const uploadSingleFile = (uploadType) => {
	try {
		const configKey = getConfigKey(uploadType);
		const maxSize = UPLOAD_CONFIG.MAX_FILE_SIZES[configKey];

		if (!maxSize) {
			throw new Error(`Unknown upload type: ${uploadType}`);
		}

		const storage = createStorage(uploadType);
		const fileFilter = createFileFilter(uploadType);

		return multer({
			storage: storage,
			fileFilter: fileFilter,
			limits: {
				fileSize: maxSize,
			},
		}).single("file");
	} catch (error) {
		console.error("Error creating upload middleware:", error);
		// Return error handling middleware
		return (req, res, next) => {
			res.status(500).json({
				status: "fail",
				message: `Upload configuration error: ${error.message}`,
			});
		};
	}
};

/**
 * Multiple file upload middleware for papers (PDF + optional image)
 */
const uploadMultipleFiles = (uploadType) => {
	try {
		const configKey = getConfigKey(uploadType);
		const maxSize = UPLOAD_CONFIG.MAX_FILE_SIZES[configKey];

		if (!maxSize) {
			throw new Error(`Unknown upload type: ${uploadType}`);
		}

		const storage = uploadType === "papers" ? createPaperStorage() : createStorage(uploadType);
		const fileFilter = createFileFilter(uploadType);

		return multer({
			storage: storage,
			fileFilter: fileFilter,
			limits: {
				fileSize: maxSize,
			},
		}).fields([
			{ name: "file", maxCount: 1 },
			{ name: "image", maxCount: 1 }
		]);
	} catch (error) {
		console.error("Error creating upload middleware:", error);
		// Return error handling middleware
		return (req, res, next) => {
			res.status(500).json({
				status: "fail",
				message: `Upload configuration error: ${error.message}`,
			});
		};
	}
};

/**
 * Delete uploaded file
 */
const deleteUploadedFile = (uploadType, filename) => {
	try {
		const uploadPath = UPLOAD_CONFIG.getUploadPath(uploadType);
		const filePath = path.join(uploadPath, filename);

		// Prevent directory traversal attacks
		if (!filePath.startsWith(uploadPath)) {
			throw new Error("Invalid file path");
		}

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			return true;
		}
		return false;
	} catch (error) {
		console.error("Error deleting file:", error);
		return false;
	}
};

module.exports = {
	uploadSingleFile,
	uploadMultipleFiles,
	deleteUploadedFile,
	UPLOAD_CONFIG,
};
