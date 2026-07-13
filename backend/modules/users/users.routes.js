const express = require("express");
const registerUser = require("./controllers/register.controller");
const loginUser = require("./controllers/login.controller");
const refreshController = require("./controllers/refresh.controller");
const { getUserProfileWithRank, updateProfile, updateReview } = require("./controllers/profile.controller");
const forgetPassword = require("./controllers/forgetPassword.controller");
const resetPassword = require("./controllers/resetPassword.controller");
const { requireUser } = require("../../middleware/auth");

const usersRoutes = express.Router();

// Public Routes
usersRoutes.post("/register", registerUser);
usersRoutes.post("/login", loginUser);
usersRoutes.post("/forget-password", forgetPassword);
usersRoutes.post("/reset-password", resetPassword);
usersRoutes.post("/refresh", refreshController);

// Protected routes for registered users
usersRoutes.get("/profile", requireUser, getUserProfileWithRank);
usersRoutes.put("/profile", requireUser, updateProfile);
usersRoutes.put("/profile/review", requireUser, updateReview);

module.exports = usersRoutes;