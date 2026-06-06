const express = require("express");
const registerUser = require("./controllers/register.controller");
const loginUser = require("./controllers/login.controller");
const { getUserProfileWithRank, updateProfile } = require("./controllers/profile.controller");
const forgetPassword = require("./controllers/forgetPassword.controller");
const resetPassword = require("./controllers/resetPassword.controller");
const { requireUser } = require("../../middleware/auth");

const usersRoutes = express.Router();

// Public Routes
usersRoutes.post("/register", registerUser);
usersRoutes.post("/login", loginUser);
usersRoutes.post("/forget-password", forgetPassword);
usersRoutes.post("/reset-password", resetPassword);

// Protected routes for registered users
usersRoutes.get("/profile", requireUser, getUserProfileWithRank);
usersRoutes.put("/profile", requireUser, updateProfile);

module.exports = usersRoutes;