const { verifyAccessToken } = require("../managers/jwtManager");

const createAuthError = (message = "Unauthorized") => {
	const error = new Error(message);
	error.statusCode = 401;
	return error;
};

const getTokenFromHeader = (authorizationHeader = "") => {
	const [scheme, token] = authorizationHeader.split(" ");

	if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
		throw createAuthError();
	}

	return token;
};

const requireAuth = (allowedAccountTypes = []) => (req, _res, next) => {
	try {
		const token = getTokenFromHeader(req.headers.authorization);
		const payload = verifyAccessToken(token);

		if (payload.tokenType !== "access") {
			throw createAuthError();
		}

		if (
			Array.isArray(allowedAccountTypes) &&
			allowedAccountTypes.length > 0 &&
			!allowedAccountTypes.includes(payload.accountType)
		) {
			throw createAuthError("Forbidden");
		}

		req.auth = payload;
		req.userId = payload.sub;
		req.userType = payload.accountType;
		req.userRole = payload.accountType;

		next();
	} catch (error) {
		error.statusCode = error.statusCode || 401;
		next(error);
	}
};

const requireAdmin = requireAuth(["admin"]);

const requireUser = requireAuth(["user"]);

module.exports = {
	requireAuth,
	requireAdmin,
	requireUser,
};