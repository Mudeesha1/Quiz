const bcrypt = require("bcrypt");
const User = require("../../../models/users.model");
const { generateUserTokenPair } = require("../../../managers/jwtManager");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildValidationErrors = (payload) => {
	const errors = {};

	if (!payload.identifier?.trim()) {
		errors.identifier = "Username or email is required.";
	}

	if (!payload.password) {
		errors.password = "Password is required.";
	} else if (payload.password.length < 6 || payload.password.length > 11) {
		errors.password = "Password must be between 6 and 11 characters.";
	} else if (!/[A-Z]/.test(payload.password) || !/\d/.test(payload.password)) {
		errors.password = "Password must include at least one capital letter and one number.";
	}

	return errors;
};

const loginController = async (req, res, next) => {
	try {
		const payload = {
			identifier: req.body.identifier ?? req.body.username,
			password: req.body.password,
		};

		const validationErrors = buildValidationErrors(payload);
		if (Object.keys(validationErrors).length > 0) {
			return res.status(400).json({
				status: "fail",
				message: "Validation failed",
				fieldErrors: validationErrors,
			});
		}

		const identifier = payload.identifier.trim();
		const normalizedIdentifier = identifier.toLowerCase();
		const user = await User.findOne({
			where: EMAIL_REGEX.test(normalizedIdentifier)
				? { email: normalizedIdentifier }
				: { username: identifier },
		});

		if (!user) {
			return res.status(401).json({
				status: "fail",
				message: "Invalid username/email or password.",
				fieldErrors: {
					identifier: "Invalid username/email or password.",
				},
			});
		}

		const passwordMatches = await bcrypt.compare(payload.password, user.password);
		if (!passwordMatches) {
			return res.status(401).json({
				status: "fail",
				message: "Invalid username/email or password.",
				fieldErrors: {
					identifier: "Invalid username/email or password.",
				},
			});
		}

		const tokens = generateUserTokenPair(user);

		return res.status(200).json({
			status: "success",
			message: "Login successful",
			data: {
				id: user.id,
				fullname: user.fullname,
				username: user.username,
				email: user.email,
				profile_url: user.profile_url,
				grade_id: user.grade_id,
				current_xp: user.current_xp,
				current_level_id: user.current_level_id,
			},
			tokens,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = loginController;
