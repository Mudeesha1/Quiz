const User = require("../../../models/users.model");
const Admin = require("../../../models/admin.model");
const { verifyRefreshToken, generateUserTokenPair, generateAdminTokenPair } = require("../../../managers/jwtManager");

const refreshController = async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return res.status(400).json({
				status: "fail",
				message: "Refresh token is required.",
			});
		}

		const payload = verifyRefreshToken(refreshToken);
		if (!payload || payload.tokenType !== "refresh") {
			return res.status(401).json({
				status: "fail",
				message: "Invalid or expired refresh token.",
			});
		}

		let tokens;
		let data;

		if (payload.accountType === "admin") {
			const admin = await Admin.findByPk(payload.sub);
			if (!admin) {
				return res.status(401).json({
					status: "fail",
					message: "Admin account not found.",
				});
			}
			tokens = generateAdminTokenPair(admin);
			data = {
				id: admin.id,
				admin_name: admin.admin_name,
				username: admin.username,
				email: admin.email,
				profile_url: admin.profile_url,
			};
		} else {
			const user = await User.findByPk(payload.sub);
			if (!user) {
				return res.status(401).json({
					status: "fail",
					message: "User account not found.",
				});
			}
			tokens = generateUserTokenPair(user);
			data = {
				id: user.id,
				fullname: user.fullname,
				username: user.username,
				email: user.email,
				profile_url: user.profile_url,
				grade_id: user.grade_id,
				current_xp: user.current_xp,
				current_level_id: user.current_level_id,
			};
		}

		return res.status(200).json({
			status: "success",
			message: "Tokens refreshed successfully",
			tokens,
			data,
		});
	} catch (error) {
		return res.status(401).json({
			status: "fail",
			message: "Invalid or expired refresh token.",
		});
	}
};

module.exports = refreshController;
