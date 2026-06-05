const path = require("path");

const UPLOAD_CONFIG = {
	// Base upload directory
	BASE_DIR: path.join(__dirname, "../uploads"),

	// Upload directories for different file types
	DIRS: {
		QUIZ_QUESTIONS: "quiz-questions",
		PAPERS: "papers",
		BADGES: "badges",
		PROFILES: "profiles",
	},

	// File size limits (in bytes)
	MAX_FILE_SIZES: {
		QUIZ_QUESTIONS: 5 * 1024 * 1024, // 5 MB
		PAPERS: 50 * 1024 * 1024, // 50 MB
		BADGES: 2 * 1024 * 1024, // 2 MB
		PROFILES: 3 * 1024 * 1024, // 3 MB
	},

	// Allowed file types
	ALLOWED_MIME_TYPES: {
		QUIZ_QUESTIONS: ["image/jpeg", "image/png", "image/webp"],
		PAPERS: ["application/pdf"],
		BADGES: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
		PROFILES: ["image/jpeg", "image/png", "image/webp"],
	},

	// File extensions
	ALLOWED_EXTENSIONS: {
		QUIZ_QUESTIONS: [".jpg", ".jpeg", ".png", ".webp"],
		PAPERS: [".pdf"],
		BADGES: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
		PROFILES: [".jpg", ".jpeg", ".png", ".webp"],
	},

	// API URL prefix for serving files
	API_PREFIX: "/api/v1/uploads",

	// Get full path for upload directory
	getUploadPath: (type) => {
		const typeKey = Object.keys(UPLOAD_CONFIG.DIRS).find(
			(key) => UPLOAD_CONFIG.DIRS[key] === type
		);
		if (!typeKey) {
			throw new Error(`Invalid upload type: ${type}`);
		}
		return path.join(UPLOAD_CONFIG.BASE_DIR, UPLOAD_CONFIG.DIRS[typeKey]);
	},

	// Get URL path for file
	getUrlPath: (type, filename) => {
		const typeKey = Object.keys(UPLOAD_CONFIG.DIRS).find(
			(key) => UPLOAD_CONFIG.DIRS[key] === type
		);
		if (!typeKey) {
			throw new Error(`Invalid upload type: ${type}`);
		}
		return `${UPLOAD_CONFIG.API_PREFIX}/${UPLOAD_CONFIG.DIRS[typeKey]}/${filename}`;
	},
};

module.exports = UPLOAD_CONFIG;
