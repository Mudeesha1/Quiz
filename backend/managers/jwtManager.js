const jwt = require("jsonwebtoken");

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const getIssuer = () => process.env.JWT_ISSUER?.trim();

const buildTokenPayload = (account, accountType, tokenType) => ({
	sub: String(account.id),
	accountType,
	tokenType,
	email: account.email,
	username: account.username,
	name: account.fullname || account.admin_name,
});

const signToken = (payload, secret, expiresIn) =>
	jwt.sign(payload, secret, {
		expiresIn,
		...(getIssuer() ? { issuer: getIssuer() } : {}),
	});

const generateAccessToken = (account, accountType) =>
	signToken(
		buildTokenPayload(account, accountType, "access"),
		getAccessSecret(),
		ACCESS_EXPIRES_IN
	);

const generateRefreshToken = (account, accountType) =>
	signToken(
		buildTokenPayload(account, accountType, "refresh"),
		getRefreshSecret(),
		REFRESH_EXPIRES_IN
	);

const generateTokenPair = (account, accountType) => ({
	accessToken: generateAccessToken(account, accountType),
	refreshToken: generateRefreshToken(account, accountType),
});

const generateAdminTokenPair = (admin) => generateTokenPair(admin, "admin");

const generateUserTokenPair = (user) => generateTokenPair(user, "user");

const verifyAccessToken = (token) =>
	jwt.verify(token, getAccessSecret(), {
		...(getIssuer() ? { issuer: getIssuer() } : {}),
	});

const verifyRefreshToken = (token) =>
	jwt.verify(token, getRefreshSecret(), {
		...(getIssuer() ? { issuer: getIssuer() } : {}),
	});

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	generateTokenPair,
	generateAdminTokenPair,
	generateUserTokenPair,
	verifyAccessToken,
	verifyRefreshToken,
};
