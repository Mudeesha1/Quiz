const bcrypt = require("bcrypt");
const User = require("../../../models/users.model");
const Grade = require("../../../models/grade.model");
const { generateUserTokenPair } = require("../../../managers/jwtManager");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildProfileUrl = (fullName) => {
	const initials = fullName
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() || "")
		.join("");

	const seed = encodeURIComponent(initials || fullName.trim().replace(/\s+/g, "").toUpperCase());
	return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&background=%23ffffff`;
};

const buildValidationErrors = (payload) => {
	const errors = {};

	if (!payload.fullName?.trim()) errors.fullName = "Full name is required.";
	if (!payload.username?.trim()) errors.username = "Username is required.";
	if (!payload.email?.trim()) {
		errors.email = "Email address is required.";
	} else if (!EMAIL_REGEX.test(payload.email.trim())) {
		errors.email = "Please enter a valid email address.";
	}

	if (!payload.password) {
		errors.password = "Password is required.";
	} else {
		if (payload.password.length < 6 || payload.password.length > 11) {
			errors.password = "Password must be between 6 and 11 characters.";
		} else if (!/[A-Z]/.test(payload.password) || !/\d/.test(payload.password)) {
			errors.password = "Password must include at least one capital letter and one number.";
		}
	}

	if (!payload.confirmPassword) {
		errors.confirmPassword = "Confirm password is required.";
	} else if (payload.password !== payload.confirmPassword) {
		errors.confirmPassword = "Passwords do not match.";
	}

	if (!payload.grade) errors.grade = "Grade is required.";
	if (!payload.schoolName?.trim()) errors.schoolName = "School name is required.";

	return errors;
};

const registerController = async (req, res, next) => {
	try {
		const payload = {
			fullName: req.body.fullName,
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			confirmPassword: req.body.confirmPassword,
			grade: req.body.grade,
			schoolName: req.body.schoolName,
		};

		const validationErrors = buildValidationErrors(payload);
		if (Object.keys(validationErrors).length > 0) {
			return res.status(400).json({
				status: "fail",
				message: "Validation failed",
				fieldErrors: validationErrors,
			});
		}

		const [existingByUsername, existingByEmail] = await Promise.all([
			User.findOne({ where: { username: payload.username.trim() } }),
			User.findOne({ where: { email: payload.email.trim().toLowerCase() } }),
		]);

		const conflictErrors = {};
		if (existingByUsername) {
			conflictErrors.username = "This username is already taken.";
		}
		if (existingByEmail) {
			conflictErrors.email = "This email is already registered.";
		}

		if (Object.keys(conflictErrors).length > 0) {
			return res.status(409).json({
				status: "fail",
				message: "User already exists",
				fieldErrors: conflictErrors,
			});
		}

		const grade = await Grade.findByPk(payload.grade);
		if (!grade) {
			return res.status(400).json({
				status: "fail",
				message: "Validation failed",
				fieldErrors: { grade: "Selected grade is invalid." },
			});
		}

		const hashedPassword = await bcrypt.hash(payload.password, 10);
		const profileUrl = buildProfileUrl(payload.fullName);

		const user = await User.create({
			fullname: payload.fullName.trim(),
			username: payload.username.trim(),
			email: payload.email.trim().toLowerCase(),
			password: hashedPassword,
			school_name: payload.schoolName.trim(),
			profile_url: profileUrl,
			grade_id: Number(payload.grade),
		});

		const tokens = generateUserTokenPair(user);

		return res.status(201).json({
			status: "success",
			message: "Registration successful",
			data: {
				id: user.id,
				fullname: user.fullname,
				username: user.username,
				email: user.email,
				school_name: user.school_name,
				profile_url: user.profile_url,
				grade_id: user.grade_id,
			},
			tokens,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = registerController;