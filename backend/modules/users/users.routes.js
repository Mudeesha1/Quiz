const express = require("express");
const registerUser = require("./controllers/register.controller");
const loginUser = require("./controllers/login.controller");
const getUserProfileWithRank = require("./controllers/profile.controller");
const { requireUser } = require("../../middleware/auth");

const usersRoutes = express.Router();

// Public Routes
usersRoutes.post("/register", registerUser);
usersRoutes.post("/login", loginUser);

// Protected routes for registered users
usersRoutes.get("/profile", requireUser, getUserProfileWithRank);

module.exports = usersRoutes;